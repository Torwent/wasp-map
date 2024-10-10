## Development server 💻

Install [bun](https://bun.sh/docs/installation) (this is for windows, if using a different OS look it up in bun docs)(might require a restart):

```
powershell -c "irm bun.sh/install.ps1|iex"
```

Now you will need to install the project dependencies, it's submodule dependencies, run the submodule to generate the map tiles (which will take a few minutes).
You can do that with the following commands assuming you are currently on the project directory:

```
bun install
cd static/layers-osrs/
bun install
bun start
```

Now you are finally able to run the main project, make sure to go back to the main project directory if you are not there yet:

```
cd ../..
bun dev
```

Visit http://localhost:3000/ and your map should be online 😄

## Hosting 🚀

You can basically follow the same commands as above. the only change is that you might want to add `NODE_ENV=production` and `--production` flag to the main project install command.

### Coolify 🆒

To host on coolify specifically you should pick the following settings:

- Build pack: \*Nixpacks\*\*
- Build:
- Install command: `bun install --production & cd static/layers-osrs & bun install`
- Build command: `echo hello world` this is just to get around a coolify bug. Might be able to leave it blank in the future
- Start command: `bun static/layers-osrs/main.ts & NODE_ENV=production bun src/main.ts`
- Port: **3000**

The rest leave on the defaults 👍

## Credits 🤗

This was developed as part of the [RuneScape Wiki](https://runescape.wiki/ "The RuneScape Wiki") maps project.
This specific project was forked from https://github.com/mejrs/mejrs.github.io to change things I didn't like about it for my personal needs.
