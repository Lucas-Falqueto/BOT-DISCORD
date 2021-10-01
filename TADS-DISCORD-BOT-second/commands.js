const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType, VoiceConnectionStatus } = require('@discordjs/voice');

const ytdl = require('ytdl-core');

class musicPlayer {

    constructor(client) {
        this.client = client;

        this.queue = new Map();

        this.player = createAudioPlayer();

        this.music = [];

        this.songs = [];

    }

    async listSongs(msg) {
        if (this.songs.length === 0) {
            msg.reply(`Não a musica na lista`);
        } else {
            for (let i = 0; i < this.songs.length; i++) {
                await msg.reply(`As musicas na lista são:\n${this.songs[i]}`);
            }
        }

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

            if (this.music.length !== 0) {
                this.songs.push(song);
            } else {
                this.play(msg.guild, song);
            }

            return true;

        } catch (error) {
            console.log(error)
            this.queue.delete(msg.guild.id)
            return await msg.reply(`Um erro ocorreu ${song.titulo} foi removido\n${error}`)
        }
    }

    async play(server, song) {

        this.music.push(song);
        let music = this.music[0];

        let serverQueue = this.queue.get(server.id)


        if (!music) {

            console.log('nao a musica');

            this.queue.delete(server.id)

            return
        }

        //Teste

        serverQueue.connection.on(VoiceConnectionStatus.Ready, (oldState, newState) => {

            // console.log(oldState);

            if (newState) {
                console.log('Connection is in the Ready state!');

                setTimeout(() => {
                    let resource = createAudioResource(ytdl(music.url), { inputType: StreamType.WebmOpus, inlineVolume: true });

                    resource.volume.setVolume(0.2);

                    serverQueue.connection.subscribe(this.player);

                    this.player.play(resource);
                }, 5000)

                this.player.on(AudioPlayerStatus.Playing, () => {
                    console.log('Audio está preste a começar');
                });

                this.player.on(AudioPlayerStatus.AutoPaused, () => {
                    console.log('Algo deu errado');
                })

                this.player.on('error', error => {
                    // console.log(error.resource);
                    return;
                });

                this.player.on(AudioPlayerStatus.Idle, () => {
                    console.log('Musica acabou');
                    this.music.pop();
                    let songNow = this.songs.shift();
                    this.play(server, songNow);
                });
            }
        });






    }

    // getNext(server, songNow) {
    //     this.play(server, songNow);
    // }

}

module.exports = { musicPlayer }