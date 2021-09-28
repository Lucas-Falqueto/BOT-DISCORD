const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

const ytdl = require('ytdl-core');

class musicPlayer {

    constructor(client) {
        this.client = client;

        this.queue = new Map();

        this.player = createAudioPlayer();

        this.music = [];

        this.songs = [];

    }

    listSongs(msg) {
        if (this.songs.length === 0) {
            msg.reply(`Não a musica na lista`);
        }

        this.songs.forEach(el => {
            msg.reply(`Lista das musicas:\n${el.titulo}`);
        })
    }

    async addSong(msg, musicLink) {
        let queue = this.queue.get(msg.guild.id)
        if (queue) {
            let queueConstructor = {
                textChannel: msg.channel,
                VoiceChannel: msg.member.voice.channel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true,
            }
            let songInfo = await ytdl.getInfo(musicLink);

            let song = {
                titulo: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url
            }

            await msg.reply(`${song.titulo} foi adcionada a fila`);

            queueConstructor.songs.push(song);
            this.queue.set(msg.guild.id, queueConstructor);
            queue = this.queue.get(msg.guild.id)
        }
        else {
            console.log('Done')
        }
    }
    async musicPlay(msg, musicLink) {
        let channel = msg.member.voice.channel;
        if (!channel) return msg.reply('você precisa estar em um canal de voz');

        this.queueConstructor = {
            textChannel: msg.channel,
            VoiceChannel: channel,
            connection: null,
            volume: 5,
            playing: true,
        }

        let songInfo = await ytdl.getInfo(musicLink);

        let song = {
            titulo: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url
        }

        await msg.reply(`${song.titulo} foi adcionada a fila`);

        this.queue.set(msg.guild.id, this.queueConstructor);

        try {

            this.queueConstructor.connection = joinVoiceChannel({

                channelId: channel.id,

                guildId: channel.guild.id,

                adapterCreator: channel.guild.voiceAdapterCreator
            })

            this.play(msg.guild, song);

            return true;

        } catch (error) {
            console.log(error)
            this.queue.delete(msg.guild.id)
            return await msg.reply(`Um erro ocorreu ${songInfo.titulo} foi removido\n${error}`)
        }
    }

    play(server, song) {


        if (this.music.length >= 1) {
            this.songs.push(song);
        } else {
            this.music.push(song);
        }

        let music = this.music[0];

        let serverQueue = this.queue.get(server.id)


        if (!music) {

            serverQueue.VoiceChannel.leave()

            this.queue.delete(server.id)

            return
        }
        let resource = createAudioResource(ytdl(music.url), { inlineVolume: true })

        resource.volume.setVolume(0.2)

        serverQueue.connection.subscribe(this.player)

        this.player.play(resource)

    }
    getNext(server) {
        console.log("getNext!!")
    }

}

module.exports = { musicPlayer }