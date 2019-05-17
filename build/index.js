'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true,
})

var _extends =
  Object.assign ||
  function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i]
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key]
        }
      }
    }
    return target
  }

var _createClass = (function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i]
      descriptor.enumerable = descriptor.enumerable || false
      descriptor.configurable = true
      if ('value' in descriptor) descriptor.writable = true
      Object.defineProperty(target, descriptor.key, descriptor)
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps)
    if (staticProps) defineProperties(Constructor, staticProps)
    return Constructor
  }
})()

var _timelinePlus = require('timeline-plus')

var vis = _interopRequireWildcard(_timelinePlus)

require('timeline-plus/dist/timeline.css')

var _react = require('react')

var _react2 = _interopRequireDefault(_react)

var _propTypes = require('prop-types')

var _propTypes2 = _interopRequireDefault(_propTypes)

var _difference = require('lodash/difference')

var _difference2 = _interopRequireDefault(_difference)

var _intersection = require('lodash/intersection')

var _intersection2 = _interopRequireDefault(_intersection)

var _isEqual = require('lodash/isEqual')

var _isEqual2 = _interopRequireDefault(_isEqual)

var _omit = require('lodash/omit')

var _omit2 = _interopRequireDefault(_omit)

var _keys = require('lodash/keys')

var _keys2 = _interopRequireDefault(_keys)

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj
  } else {
    var newObj = {}
    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key))
          newObj[key] = obj[key]
      }
    }
    newObj.default = obj
    return newObj
  }
}

function _objectWithoutProperties(obj, keys) {
  var target = {}
  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue
    target[i] = obj[i]
  }
  return target
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function')
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    )
  }
  return call && (typeof call === 'object' || typeof call === 'function')
    ? call
    : self
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError(
      'Super expression must either be null or a function, not ' +
        typeof superClass
    )
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  })
  if (superClass)
    Object.setPrototypeOf
      ? Object.setPrototypeOf(subClass, superClass)
      : (subClass.__proto__ = superClass)
}

var noop = function noop() {}
var events = [
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

var eventPropTypes = {}
var eventDefaultProps = {}

events.forEach(function(event) {
  eventPropTypes[event] = _propTypes2.default.func
  eventDefaultProps[event + 'Handler'] = noop
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
  return (
    array.filter(function(time2) {
      return time === time2
    }).length > 0
  )
}

function customTimesAreEqual(timesArr1, timesArr2) {
  return !Object.values(timesArr1).some(function(time1) {
    return !timeInArray(time1, Object.values(timesArr2))
  })
}

var Timeline = (function(_Component) {
  _inherits(Timeline, _Component)

  function Timeline(props) {
    _classCallCheck(this, Timeline)

    var _this = _possibleConstructorReturn(
      this,
      (Timeline.__proto__ || Object.getPrototypeOf(Timeline)).call(this, props)
    )

    _this.state = {
      customTimes: [],
    }

    _this.container = _react2.default.createRef()
    return _this
  }

  _createClass(Timeline, [
    {
      key: 'componentDidMount',
      value: function componentDidMount() {
        var container = this.container
        var _props = this.props,
          items = _props.items,
          groups = _props.groups,
          options = _props.options

        this.$el = new vis.Timeline(container.current, items, groups, options)

        this.init()
      },
    },
    {
      key: 'shouldComponentUpdate',
      value: function shouldComponentUpdate(nextProps) {
        var _props2 = this.props,
          items = _props2.items,
          groups = _props2.groups,
          options = _props2.options,
          selection = _props2.selection,
          _props2$selectionOpti = _props2.selectionOptions,
          selectionOptions =
            _props2$selectionOpti === undefined ? {} : _props2$selectionOpti,
          customTimes = _props2.customTimes

        var itemsChanged = !(0, _isEqual2.default)(
          items.sort(),
          nextProps.items.sort()
        )
        var oldStart = options.start
        var oldEnd = options.end
        var newStart = nextProps.options.start
        var newEnd = nextProps.options.end
        var groupsChange = !(0, _isEqual2.default)(groups, nextProps.groups)
        var optionsChange = optionsDiffer(options, nextProps.options)

        // if the items changed handle this manually. Avoids flickering in re-render
        if (itemsChanged) {
          this.updateItems(nextProps.items)
        }

        // if the selection changed handle this manually. Allows users to more easily
        // control the state of selected objects.
        if (!(0, _isEqual2.default)(selection, nextProps.selection)) {
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
          var _nextProps$options = nextProps.options,
            start = _nextProps$options.start,
            end = _nextProps$options.end,
            newOptions = _objectWithoutProperties(_nextProps$options, [
              'start',
              'end',
            ])

          var prevStart = options.start,
            prevEnd = options.end,
            prevOptions = _objectWithoutProperties(options, ['start', 'end'])

          this.updateOptions(_extends({}, prevOptions, newOptions))
        }

        var customTimesChange = !customTimesAreEqual(
          customTimes,
          nextProps.customTimes
        )

        return customTimesChange
      },
    },
    {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        this.$el.destroy()
      },
    },
    {
      key: 'init',
      value: function init() {
        var _this2 = this

        var _props3 = this.props,
          items = _props3.items,
          groups = _props3.groups,
          options = _props3.options,
          selection = _props3.selection,
          _props3$selectionOpti = _props3.selectionOptions,
          selectionOptions =
            _props3$selectionOpti === undefined ? {} : _props3$selectionOpti,
          customTimes = _props3.customTimes,
          _props3$animate = _props3.animate,
          animate = _props3$animate === undefined ? true : _props3$animate,
          currentTime = _props3.currentTime

        var timelineOptions = options

        // Remove any old handlers
        if (this.oldHandlers) {
          this.oldHandlers.forEach(function(event, handler) {
            return _this2.$el.off(event, handler)
          })
        }

        // Clear old handler map
        this.oldHandlers = {}

        // Install new handlers
        events.forEach(function(event) {
          var key = event + 'Handler'
          var handler = _this2.props[key]
          if (handler) {
            _this2.$el.on(event, handler)
            _this2.oldHandlers[key] = handler
          }
        })

        if (animate) {
          // If animate option is set, we should animate the timeline to any new
          // start/end values instead of jumping straight to them
          timelineOptions = (0, _omit2.default)(options, 'start', 'end')
          this.updateWindow(options.start, options.end)
        }

        this.$el.setOptions(timelineOptions)

        if (groups.length > 0) {
          var groupsDataset = new vis.DataSet()
          groupsDataset.add(groups)
          this.$el.setGroups(groupsDataset)
        }

        this.updateItems(items)
        this.updateSelection(selection, selectionOptions)

        if (currentTime) {
          this.$el.setCurrentTime(currentTime)
        }

        // diff the custom times to decipher new, removing, updating
        var customTimeKeysPrev = (0, _keys2.default)(this.state.customTimes)
        var customTimeKeysNew = (0, _keys2.default)(customTimes)
        var customTimeKeysToAdd = (0, _difference2.default)(
          customTimeKeysNew,
          customTimeKeysPrev
        )

        var customTimeKeysToRemove = (0, _difference2.default)(
          customTimeKeysPrev,
          customTimeKeysNew
        )
        var customTimeKeysToUpdate = (0, _intersection2.default)(
          customTimeKeysPrev,
          customTimeKeysNew
        )

        // NOTE this has to be in arrow function so context of `this` is based on
        // this.$el and not `each`
        customTimeKeysToRemove.forEach(function(id) {
          return _this2.$el.removeCustomTime(id)
        })

        customTimeKeysToAdd.forEach(function(id) {
          var datetime = customTimes[id]
          _this2.$el.addCustomTime(datetime, id)
        })
        customTimeKeysToUpdate.forEach(function(id) {
          var datetime = customTimes[id]
          _this2.$el.setCustomTime(datetime, id)
        })

        // store new customTimes in state for future diff
        this.setState({
          customTimes: customTimes,
        })
      },
    },
    {
      key: 'updateItems',
      value: function updateItems(items) {
        this.$el.setItems(items)
      },
    },
    {
      key: 'updateWindow',
      value: function updateWindow(start, end) {
        this.$el.setWindow(start, end, {
          animation: this.props.animate,
        })
      },
    },
    {
      key: 'updateSelection',
      value: function updateSelection() {
        var selection =
          arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : []
        var selectionOptions =
          arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}

        this.$el.setSelection(selection, selectionOptions)
      },
    },
    {
      key: 'updateGroups',
      value: function updateGroups(groups) {
        this.$el.setGroups(groups)
      },
    },
    {
      key: 'updateOptions',
      value: function updateOptions(options) {
        this.$el.setOptions(options)
      },
    },
    {
      key: 'render',
      value: function render() {
        return _react2.default.createElement('div', { ref: this.container })
      },
    },
  ])

  return Timeline
})(_react.Component)

exports.default = Timeline

Timeline.propTypes = _extends(
  {
    items: _propTypes2.default.arrayOf(_propTypes2.default.object),
    groups: _propTypes2.default.arrayOf(_propTypes2.default.object),
    options: _propTypes2.default.objectOf(_propTypes2.default.any),
    selection: _propTypes2.default.oneOf([
      _propTypes2.default.array,
      _propTypes2.default.object,
    ]),
    customTimes: _propTypes2.default.shape({
      datetime: _propTypes2.default.instanceOf(Date),
      id: _propTypes2.default.string,
    }),
    animate: _propTypes2.default.oneOfType([
      _propTypes2.default.bool,
      _propTypes2.default.object,
    ]),
    currentTime: _propTypes2.default.oneOfType([
      _propTypes2.default.string,
      _propTypes2.default.instanceOf(Date),
      _propTypes2.default.number,
    ]),
  },
  eventPropTypes
)

Timeline.defaultProps = _extends(
  {
    items: [],
    groups: [],
    options: {},
    selection: [],
    customTimes: {},
  },
  eventDefaultProps
)
