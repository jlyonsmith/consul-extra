import parseArgs from "minimist"
import JSON5 from "json5"
import { fullVersion } from "./version"
import consul from "consul"
import flatten from "flat"
import autobind from "autobind-decorator"

@autobind
export class ConsulTool {
  constructor(toolName, log) {
    this.toolName = toolName
    this.log = log
  }

  async export(rootKey) {
    const keys = await this.consul.kv.keys(rootKey)
    let object = {}

    for (const key of keys) {
      const entry = await this.consul.kv.get(key)
      object[key] = entry.Value
    }

    const json = JSON.stringify(
      flatten.unflatten(object, { delimiter: "/" }),
      null,
      "  "
    )

    console.log(json)
  }

  async import() {}

  async run(argv) {
    const options = {
      string: [],
      boolean: ["help", "version", "debug"],
      alias: {},
      default: {},
    }

    this.args = parseArgs(argv, options)

    if (this.args.version) {
      this.log.info(`${fullVersion}`)
      return 0
    }

    let command = this.args._[0]

    command = command ? command.toLowerCase() : "help"

    this.consul = consul({ promisify: true })

    switch (command) {
      case "kv":
        const subCommand = this.args._[1]

        if (this.args.help || !subCommand) {
          this.log.info(`Usage: ${this.toolName} kv <sub-command> <options>

Description:

Operations on the key/value store

Sub-Commands:
  json-export     Export keys in JSON format
  json-import     Import keys from JSON/JSON5 format
`)
          return 0
        }

        switch (subCommand) {
          case "json-export":
            if (this.args.help) {
              this.log.info(`Usage: ${this.toolName} kv json-export <root-key>

Description:

Exports keys from a JSON file.
`)
              return 0
            }
            const rootKey = this.args._[2] || ""

            await this.export(rootKey)
            break

          case "json-import":
            if (this.args.help) {
              this.log.info(`Usage: ${this.toolName} kv json-import <file>

Description:

Imports keys from a JSON/JSON5 file.
`)
              return 0
            }
            await this.import()
            break
          default:
            this.log.error("Unknown commond '${subCommand}'")
            break
        }
        break

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
`)
        return 0
    }

    return 0
  }
}
