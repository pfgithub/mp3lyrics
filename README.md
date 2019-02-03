# mp3lyrics
Adds song lyrics to the Album field of MP3 files and adds cover art from Genius.

## Installation

```bash
yarn global add pfgithub/mp3lyrics
```

add your genius access token to `~/.config/yarn/global/node_modules/mp3lyrics/secret.json` as `{accessToken: accessToken}`

> Note: This is not a reasonable method of saving access tokens.

## Usage

mp3lyrics reads the Artist and Title fields of a mp3 file. Make sure these are set properly.

```bash
mp3lyrics <mp3file.mp3>
```

You will be prompted to choose which entry in Genius the file is. If none match, you can Search for a different title or you can None to set to `???`

### On a folder
```fish
# bash shell
for file in *.mp3; do
  [ -e "$file" ] || continue
  mp3lyrics "$file";
done
```
```fish
#!/usr/bin/fish
for file in 4K\ Video\ Downloader/*.mp3;
  mp3lyrics "$file";
end
```
