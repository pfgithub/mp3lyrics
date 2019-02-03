const Genius = require("node-genius");
const {prompt} = require("enquirer");
const Lyricist = require('lyricist');
const ffmetadata = require("ffmetadata");
const request = require("request");
const fs = require("fs");
const path = require("path");

let filename = process.argv[2];
let apiKey = require("./secret.json").accessToken;
//  ^ access token

const client = new Genius(apiKey);
const lyricist = new Lyricist(apiKey);

let pify = (cb) => new Promise((resolve,reject) => cb((err,res)=>err?reject(err):resolve(res)));

async function getLyrics(search,title){
	let results = JSON.parse(await pify(_ => client.search(search, _)));
	let hits = results.response.hits;

	let choices = hits.slice(0,3);
	choices = choices.map(({result}) => ({message: result.full_title, value: result}));
	choices.push({message:"Search...",value:"search"});
	choices.push({message:"None",value:"none"});

	let answer = await prompt({
		type: "select",
		name:"song",
		message:"Pick for "+title,
		choices: choices
	});
	answer = answer.song;
	let thumbnail = answer.song_art_image_thumbnail_url;
	if(answer === "search") {
		return getLyrics((await prompt({
			type: "input",
			message: "Search Term:",
			name: "search"
		})).search, title);
	}
	if(answer === "none") {return "???";}
	//console.log(answer,answer.id);
	let song;
	await Promise.all([
		(async () => {
			song = await lyricist.song(answer.id, {fetchLyrics:true});
		})(),
		(async () => {
			let stream = request(thumbnail).pipe(fs.createWriteStream("/tmp/icon.png"));
			await pify(_ => stream.on("finish", _));
		})()
	]);
	return song.lyrics;
}

async function doasync(){
	fs.copyFileSync(path.join(__dirname, "unknown.png"), "/tmp/icon.png");
	let data = await pify(_ => ffmetadata.read(filename, _));
	console.log(data);
	if(!data.album){
		// parse
		let artist = data.artist.split` · `[0];
		let title = data.title.split` · `[0];
		// lyrics
		let lyrics = await getLyrics(artist + " - " + title, data.artist + " - " + data.title);
		// write
		console.log("ICON IS ", "/tmp/icon.png");
		await pify(_ => ffmetadata.write(
			filename,
			{album:lyrics},
			{attachments:["/tmp/icon.png"]},
			_
		));
	}else{
		console.log("Skipping "+data.artist + " - " + data.title);
	}
	fs.unlinkSync("/tmp/icon.png");
}
doasync();

//getLyrics("Cradles", "Sub Urban")
//

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});
