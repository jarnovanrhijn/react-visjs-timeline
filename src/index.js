import * as vis from 'timeline-plus'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import difference from 'lodash/difference'
import intersection from 'lodash/intersection'
import isEqual from 'lodash/isEqual'
import omit from 'lodash/omit'
import keys from 'lodash/keys'

const noop = function() {}
const events = [
  'currentTimeTick',
  'click',
  'contextmenu',
  'doubleClick',
  'groupDragged',
  'changed',
  'rangechange',
  'rangechanged',
  'select',
  'timechange',
  'timechanged',
  'mouseOver',
  'mouseMove',
  'mouseDown',
  'mouseUp',
  'itemover',
  'itemout',
]

const eventPropTypes = {}
const eventDefaultProps = {}

events.forEach(event => {
  eventPropTypes[event] = PropTypes.func
  eventDefaultProps[`${event}Handler`] = noop
})

function optionsDiffer(options1, options2) {
  return (
    options1.template !== options2.template ||
    options1.horizontalScroll !== options2.horizontalScroll ||
    options1.maxHeight !== options2.maxHeight ||
    options1.minHeight !== options2.minHeight ||
    options1.showCurrentTime !== options2.showCurrentTime ||
    options1.width !== options2.width ||
    options1.zoomable !== options2.zoomable ||
    options1.editable !== options2.editable ||
    options1.hiddenDates !== options2.hiddenDates
  )
}

function timeInArray(time, array) {
  return array.filter(time2 => time === time2).length > 0
}

function customTimesAreEqual(timesArr1, timesArr2) {
  return !Object.values(timesArr1).some(
    time1 => !timeInArray(time1, Object.values(timesArr2))
  )
}

export default class Timeline extends Component {
  constructor(props) {
    super(props)
    this.state = {
      customTimes: [],
    }

    this.container = React.createRef()
  }

  componentDidMount() {
    const { container } = this
    const { items, groups, options } = this.props

    this.$el = new vis.Timeline(container.current, items, groups, options)

    this.init()
  }

  shouldComponentUpdate(nextProps) {
    const {
      items,
      groups,
      options,
      selection,
      selectionOptions = {},
      customTimes,
    } = this.props

    const oldStart = options.start
    const oldEnd = options.end
    const newStart = nextProps.options.start
    const newEnd = nextProps.options.end

    const itemsChanged = !isEqual(items.sort(), nextProps.items.sort())
    const groupsChange = !isEqual(groups, nextProps.groups)
    const optionsChange = optionsDiffer(options, nextProps.options)

    // if the items changed handle this manually. Avoids flickering in re-render
    if (itemsChanged) {
      this.updateItems(nextProps.items)
    }

    // if the selection changed handle this manually. Allows users to more easily
    // control the state of selected objects.
    if (!isEqual(selection, nextProps.selection)) {
      this.updateSelection(nextProps.selection, selectionOptions)
    }

    // if the window changed, handle this manually. Helps avoid flickering by
    // unnecessary renders.
    if (oldStart !== newStart || oldEnd !== newEnd) {
      this.updateWindow(newStart, newEnd)
    }

    // If the groups change, re-render them
    if (groupsChange) {
      this.updateGroups(nextProps.groups)
    }

    // If options change, update options.
    if (optionsChange) {
      const { start, end, ...newOptions } = nextProps.options
      const { start: prevStart, end: prevEnd, ...prevOptions } = options
      this.updateOptions({
        ...prevOptions,
        ...newOptions,
      })
    }

    const customTimesChange = !customTimesAreEqual(
      customTimes,
      nextProps.customTimes
    )

    return customTimesChange
  }

  componentWillUnmount() {
    this.$el.destroy()
  }

  init() {
    const {
      items,
      groups,
      options,
      selection,
      selectionOptions = {},
      customTimes,
      animate = true,
      currentTime,
    } = this.props

    let timelineOptions = options

    // Remove any old handlers
    if (this.oldHandlers) {
      this.oldHandlers.forEach((event, handler) => this.$el.off(event, handler))
    }

    // Clear old handler map
    this.oldHandlers = {}

    // Install new handlers
    events.forEach(event => {
      const key = `${event}Handler`
      const handler = this.props[key]
      if (handler) {
        this.$el.on(event, handler)
        this.oldHandlers[key] = handler
      }
    })

    if (animate) {
      // If animate option is set, we should animate the timeline to any new
      // start/end values instead of jumping straight to them
      timelineOptions = omit(options, 'start', 'end')
      this.updateWindow(options.start, options.end)
    }

    this.$el.setOptions(timelineOptions)

    if (groups.length > 0) {
      const groupsDataset = new vis.DataSet()
      groupsDataset.add(groups)
      this.$el.setGroups(groupsDataset)
    }

    this.updateItems(items)
    this.updateSelection(selection, selectionOptions)

    if (currentTime) {
      this.$el.setCurrentTime(currentTime)
    }

    // diff the custom times to decipher new, removing, updating
    const customTimeKeysPrev = keys(this.state.customTimes)
    const customTimeKeysNew = keys(customTimes)
    const customTimeKeysToAdd = difference(
      customTimeKeysNew,
      customTimeKeysPrev
    )

    const customTimeKeysToRemove = difference(
      customTimeKeysPrev,
      customTimeKeysNew
    )
    const customTimeKeysToUpdate = intersection(
      customTimeKeysPrev,
      customTimeKeysNew
    )

    // NOTE this has to be in arrow function so context of `this` is based on
    // this.$el and not `each`
    customTimeKeysToRemove.forEach(id => this.$el.removeCustomTime(id))

    customTimeKeysToAdd.forEach(id => {
      const datetime = customTimes[id]
      this.$el.addCustomTime(datetime, id)
    })
    customTimeKeysToUpdate.forEach(id => {
      const datetime = customTimes[id]
      this.$el.setCustomTime(datetime, id)
    })

    // store new customTimes in state for future diff
    this.setState({
      customTimes,
    })
  }

  updateItems(items) {
    this.$el.setItems(items)
  }

  updateWindow(start, end) {
    this.$el.setWindow(start, end, {
      animation: this.props.animate,
    })
  }

  updateSelection(selection = [], selectionOptions = {}) {
    this.$el.setSelection(selection, selectionOptions)
  }

  updateGroups(groups) {
    this.$el.setGroups(groups)
  }

  updateOptions(options) {
    this.$el.setOptions(options)
  }

  render() {
    return <div ref={this.container} />
  }
}

Timeline.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  groups: PropTypes.arrayOf(PropTypes.object),
  options: PropTypes.objectOf(PropTypes.any),
  selection: PropTypes.oneOf([PropTypes.array, PropTypes.object]),
  customTimes: PropTypes.shape({
    datetime: PropTypes.instanceOf(Date),
    id: PropTypes.string,
  }),
  animate: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  currentTime: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
    PropTypes.number,
  ]),
  ...eventPropTypes,
}

Timeline.defaultProps = {
  items: [],
  groups: [],
  options: {},
  selection: [],
  customTimes: {},
  ...eventDefaultProps,
}
