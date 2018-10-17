"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConsulTool = undefined;

var _class;

var _minimist = require("minimist");

var _minimist2 = _interopRequireDefault(_minimist);

var _json = require("json5");

var _json2 = _interopRequireDefault(_json);

var _version = require("./version");

var _consul = require("consul");

var _consul2 = _interopRequireDefault(_consul);

var _flat = require("flat");

var _flat2 = _interopRequireDefault(_flat);

var _autobindDecorator = require("autobind-decorator");

var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

var _fs = require("fs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let ConsulTool = exports.ConsulTool = (0, _autobindDecorator2.default)(_class = class ConsulTool {
  constructor(toolName, log) {
    this.toolName = toolName;
    this.log = log;
  }

  async export(rootKey) {
    try {
      const keys = await this.consul.kv.keys(rootKey);
      let object = {};

      for (const key of keys) {
        const entry = await this.consul.kv.get(key);
        object[key] = entry.Value;
      }

      const json = JSON.stringify(_flat2.default.unflatten(object, { delimiter: "/" }), null, "  ");

      console.log(json);
    } catch (error) {
      throw new Error(`Root key '${rootKey}' was not found`);
    }
  }

  async import(fileName) {
    const data = _json2.default.parse((await _fs.promises.readFile(fileName)));
    const object = (0, _flat2.default)(data, { delimiter: "/" });

    for (const key of Object.keys(object)) {
      const value = object[key];

      try {
        await this.consul.kv.set(key, value);
      } catch (error) {
        throw new Error(`Unable to write key '${key}'`);
      }

      this.log.info(`Set key '${key}' to '${value}'`);
    }
  }

  async run(argv) {
    const options = {
      string: [],
      boolean: ["help", "version", "debug"],
      alias: {},
      default: {}
    };

    this.args = (0, _minimist2.default)(argv, options);

    if (this.args.version) {
      this.log.info(`v${_version.fullVersion}`);
      return 0;
    }

    let command = this.args._[0];

    command = command ? command.toLowerCase() : "help";

    this.consul = (0, _consul2.default)({ promisify: true });

    switch (command) {
      case "kv":
        const subCommand = this.args._[1];

        if (this.args.help || !subCommand) {
          this.log.info(`Usage: ${this.toolName} kv <sub-command> <options>

Description:

Operations on the key/value store

Sub-Commands:
  json-export     Export keys in JSON format
  json-import     Import keys from JSON/JSON5 format
`);
          return 0;
        }

        switch (subCommand) {
          case "json-export":
            if (this.args.help) {
              this.log.info(`Usage: ${this.toolName} kv json-export <root-key>

Description:

Exports keys from a JSON file.
`);
              return 0;
            }
            const rootKey = this.args._[2] || "";

            await this.export(rootKey);
            break;

          case "json-import":
            if (this.args.help) {
              this.log.info(`Usage: ${this.toolName} kv json-import <file>

Description:

Imports keys from a JSON/JSON5 file.
`);
              return 0;
            }
            const fileName = this.args._[2];

            if (!fileName) {
              throw new Error(`No file name specified`);
            }

            await this.import(fileName);
            break;
          default:
            throw new Error("Unknown commond '${subCommand}'");
        }
        break;

      case "help":
      default:
        this.log.info(`
Consul Tool

Usage: ${this.toolName} <command> ...

Provides extended functionality for the consul command line tool.

Commands:
  kv        Operations related to the key/value store

Global Options:
--help      Displays this help
--version   Displays tool version
--debug     Show debug output
`);
        return 0;
    }

    return 0;
  }
}) || _class;
//# sourceMappingURL=ConsulTool.js.map