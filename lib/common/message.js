/* jshint node: true, browser: true */
var _ = require('lodash');

function Message(payload) {
  this._type = Message.MESSAGE_TYPE;
  this._payload = payload || {};
  this._context = new MessageContext();
}

module.exports = Message;

Message.MESSAGE_TYPE = 'message';

Message.validate = function(raw) {
  return raw &&
    'type' in (typeof raw.toJSON === 'function' ? raw.toJSON() : raw);
};

Message.hydrate = function(raw) {

  if(raw instanceof Message){
    return raw;
  }

  if(!Message.validate(raw)) {
    return null;
  }

  var message = new Message(raw.payload);
  message.setType(raw.type);

  Message.populate(message, raw);

  return message;
};

Message.populate = function(message, raw) {
  if(_.isObject(raw.context)) {
    var context = message.getContext();
    _.forEach(raw.context, function(value, key) {
      context.set(key, value, false);
    });
  }
};

var p = Message.prototype;

p.getType = function() {
  return this._type;
};

p.setType = function(type) {
  this._type = type;
  return this;
};

p.getPayload = function() {
  return this._payload;
};

p.setPayload = function(payload) {
  this._payload = payload;
  return this;
};

p.getContext = function() {
  return this._context;
};

p.setContext = function(context) {
  if(!(context instanceof MessageContext)) {
    throw new Error('context must be an instance of MessageContext !');
  }
  this._context = context;
  return this;
};

p.toJSON = function() {
  return {
    type: this.getType(),
    payload: this.getPayload(),
    context: this.getContext().toJSON()
  };
};

p.get = function() {
  var context = this.getContext();
  return context.get.apply(context, _.toArray(arguments));
};

p.set = function() {
  var context = this.getContext();
  context.set.apply(context, _.toArray(arguments));
  return this;
};

p.has = function() {
  var context = this.getContext();
  context.has.apply(context, _.toArray(arguments));
  return this;
};

function MessageContext() {
  this._attributes = {};
}

p = MessageContext.prototype;

p.del = function(key) {
  delete this._attributes[key];
};

p.get = function(key, defaultValue) {
  var value = _.isArray(this._attributes[key]) ?
    this._attributes[key][0] : undefined
  ;
  if(_.isUndefined(value)) {
    return defaultValue;
  }
  return value;
};

p.has = function(key) {
  return key in this._attributes;
};

p.set = function(keyOrObj, valueOrTransient, transient) {

  if(_.isObject(keyOrObj)) { //context.set({foo: 'bar'...}, transient)

    transient = _.isUndefined(valueOrTransient) ? true : false;

    _.merge(this._attributes, keyOrObj, function(srcVal, newVal) {
      return [newVal, transient];
    });

  } else if(_.isString(keyOrObj)) { //context.set('foo', 'bar', transient)

    transient = _.isUndefined(transient) ? true : false;

    this._attributes[keyOrObj] = [valueOrTransient, transient];

  }

  return this;

};

MessageContext.prototype.toJSON = function() {
  return _.reduce(this._attributes, function(json, value, key) {
    if(_.isArray(value)) {
      var transient = value[1];
      if(!transient) {
        json[key] = value[0];
      }
    }
    return json;
  }, {});
};
