# Live Person History CLI

[![Build Status](https://app.travis-ci.com/paaragon/lphistory2.svg?branch=main)](https://app.travis-ci.com/paaragon/lphistory2)

## Install

```
npm install -g lphistory2
```

## Usage

#### Help

Summary

```
$ lphistory2 --help

lphistory2 <subcommand>

where <subcommand> can be one of:

- config
- search

For more help, try running `lphistory2 <subcommand> --help`
```

Search help

```
$ lphistory2 search --help

lphistory2 search

ARGUMENTS:
  <conversation id> - a string

OPTIONS:
  --environment, -e <str>        - Environment to search [optional]
  --timestamp-shift, -t <number> - Historical request require an OAuth timestamp. Sometimes, default timestamp could be wrong. You can shift the timestamp with this option. [optional]
  --length, -l <number>          - Line length [optional]

FLAGS:
  --daemon-info, -d - By default, daemon avents are shown if different to "unsent". With this option, all daemon events will be shown
  --machine, -m     - If specified, ids will be shown instead of names. Also, timestamps will be shown instead of formatted dates
  --help, -h        - show help
```

Config help

```
$ lphistory2 config --help

lphistory2 config <subcommand>

where <subcommand> can be one of:

- list
- create
- remove
```
