"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConsulTool = void 0;

var _minimist = _interopRequireDefault(require("minimist"));

var _json = _interopRequireDefault(require("json5"));

var _version = require("./version");

var _consul = _interopRequireDefault(require("consul"));

var _flat = _interopRequireDefault(require("flat"));

var _autobindDecorator = _interopRequireDefault(require("autobind-decorator"));

var _fs = require("fs");

var _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let ConsulTool = (0, _autobindDecorator.default)(_class = class ConsulTool {
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

      const json = JSON.stringify(_flat.default.unflatten(object, {
        delimiter: "/"
      }), null, "  ");
      console.log(json);
    } catch (error) {
      throw new Error(`Root key '${rootKey}' was not found`);
    }
  }

  async import(fileName) {
    const data = _json.default.parse((await _fs.promises.readFile(fileName)));

    const object = (0, _flat.default)(data, {
      delimiter: "/"
    });

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

  async leader() {
    const result = await this.consul.status.leader();
    this.log.info(result);
  }

  async peers() {
    const results = await this.consul.status.peers();
    results.forEach(result => this.log.info(result));
  }

  async run(argv) {
    const options = {
      string: [],
      boolean: ["help", "version", "debug"],
      alias: {},
      default: {}
    };
    let args = (0, _minimist.default)(argv, options);
    this.debug = args.debug;

    if (args.version) {
      this.log.info(`v${_version.fullVersion}`);
      return 0;
    }

    let command = args._[0];
    command = command ? command.toLowerCase() : "help";
    const subCommand = args._.length > 0 ? args._[1] : "";
    this.consul = (0, _consul.default)({
      promisify: true
    });

    switch (command) {
      case "kv":
        if (args.help && !subCommand) {
          this.log.info(`Usage: ${this.toolName} kv <sub-command> <options>

Description:

Operations on the key/value store

Sub-Commands:
  export     Export keys in JSON format
  import     Import keys from JSON/JSON5 format
`);
          return 0;
        }

        switch (subCommand) {
          case "json-export":
          case "export":
            if (args.help) {
              this.log.info(`Usage: ${this.toolName} kv export <root-key>

Description:

Exports keys from a JSON file.
`);
              return 0;
            }

            const rootKey = args._[2] || "";
            await this.export(rootKey);
            break;

          case "json-import":
          case "import":
            if (args.help) {
              this.log.info(`Usage: ${this.toolName} kv import <file>

Description:

Imports keys from a JSON/JSON5 file.
`);
              return 0;
            }

            const fileName = args._[2];

            if (!fileName) {
              throw new Error(`No file name specified`);
            }

            await this.import(fileName);
            break;

          default:
            throw new Error(`Unknown 'kv' sub-command '${subCommand}'`);
        }

        break;

      case "status":
        if (args.help && !subCommand) {
          this.log.info(`Usage: ${this.toolName} status <sub-command> <options>

Description:

Operations on the key/value store

Sub-Commands:
  leader    Show the current raft leader
  pers      Return the current raft peer set
`);
          return 0;
        }

        switch (subCommand) {
          case "leader":
            if (args.help) {
              this.log.info(`Usage: ${this.toolName} status leader

Show the current raft leader.
`);
              return 0;
            }

            await this.leader();
            break;

          case "peers":
            if (args.help) {
              this.log.info(`Usage: ${this.toolName} status peers

Show the current raft peers.
`);
              return 0;
            }

            await this.peers();
            break;

          default:
            throw new Error(`Unknown 'status' sub-command '${subCommand}'`);
        }

        break;

      case "help":
      default:
        this.log.info(`
Usage: ${this.toolName} <command> ...

Provides extended functionality for the consul command line tool.

Commands:
  kv          Operations related to the key/value store
  status      Status operations

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

exports.ConsulTool = ConsulTool;
//# sourceMappingURL=ConsulTool.js.map