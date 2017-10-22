using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Android.App;
using Android.Content;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;

using WebSocket4Net;
using System.Threading.Tasks;
using System.Threading;
using Android.Media;

namespace yamadamap.Services
{
    [Service]
    class SendSoundService : Service
    {
        const string WEB_SOCKET_URL = "ws://192.168.100.100:8080/";

        Task task;
        CancellationTokenSource tokenSource;
        WebSocket ws;

        const int AUDIO_SAMPLE_RATE = 41000;
        const int AUDIO_BUFFER_BYTES = 1024 * 8;

        readonly static int RAW_BUFFER_SIZE = AudioRecord.GetMinBufferSize(AUDIO_SAMPLE_RATE, Android.Media.ChannelIn.Mono, Android.Media.Encoding.Pcm16bit);
        readonly static int CAPTURE_CACHE_SIZE = (((RAW_BUFFER_SIZE * 4) / AUDIO_BUFFER_BYTES) + 1) * AUDIO_BUFFER_BYTES;

        AudioRecord record;

        public override IBinder OnBind(Intent intent)
        {
            return null;
        }

        public override void OnCreate()
        {
            base.OnCreate();
            Console.WriteLine("OnCreate");
        }

        [return: GeneratedEnum]
        public override StartCommandResult OnStartCommand(Intent intent, [GeneratedEnum] StartCommandFlags flags, int startId)
        {

            
            
            record = new AudioRecord(Android.Media.AudioSource.Mic, AUDIO_SAMPLE_RATE, Android.Media.ChannelIn.Mono, Android.Media.Encoding.Pcm16bit, CAPTURE_CACHE_SIZE);


            ws = new WebSocket(WEB_SOCKET_URL);
            /// 文字列受信
            ws.MessageReceived += (s, e) =>
            {
                Console.WriteLine("{0}:String Received:{1}", DateTime.Now.ToString(), e.Message);
            };

            /// バイナリ受信
            ws.DataReceived += (s, e) =>
            {
                Console.WriteLine("{0}:Binary Received Length:{1}", DateTime.Now.ToString(), e.Data.Length);
            };

            /// サーバ接続完了
            ws.Opened += (s, e) =>
            {
                Console.WriteLine("{0}:Server connected.", DateTime.Now.ToString());
            };


            /// サーバ接続開始
            /// 
            TaskFactory taskFactory = new TaskFactory();
            tokenSource = new CancellationTokenSource();

            byte[] audioBuffer = new byte[CAPTURE_CACHE_SIZE / 4];

            AudioTrack audioTrack = new AudioTrack(Android.Media.Stream.Music, 44100, Android.Media.ChannelOut.Mono,
                                Android.Media.Encoding.Pcm16bit, CAPTURE_CACHE_SIZE, Android.Media.AudioTrackMode.Stream);

            task = taskFactory.StartNew(() =>
            {

                Console.WriteLine("NEW CONNECTION!!");
                
                ws.Open();

                record.StartRecording();
                audioTrack.Play();

                /// 送受信ループ
                while (true)
                {
//                    var str = "aaaaa";

                    tokenSource.Token.ThrowIfCancellationRequested();
                    
                    if (ws.State == WebSocketState.Open)
                    {
                        record.Read(audioBuffer, 0, audioBuffer.Length, 0);
                        audioTrack.Write(audioBuffer, 0, audioBuffer.Length);
                        ws.Send(audioBuffer,0,audioBuffer.Length);
                    }
                    else
                    {
                        Console.WriteLine("{0}:wait...", DateTime.Now.ToString());
                    }
                }
            });

            Task playTask = new Task(() =>
            {
                while (true)
                {
                }
            });
            playTask.Start();

            ws.Close();
            /*
            TaskFactory taskFactory = new TaskFactory();
            tokenSource = new CancellationTokenSource();

            task = taskFactory.StartNew(() =>
            {
                for (int i = 0; i < 30; i++)
                {
                    tokenSource.Token.ThrowIfCancellationRequested();
                    var str = i + "aaaaa";
                    Console.WriteLine(str);
                    Thread.Sleep(500);
                }
            }, tokenSource.Token);
            */
            return base.OnStartCommand(intent, flags, startId);
        }

        public override void OnDestroy()
        {
            base.OnDestroy();
            if (tokenSource != null)
            {
                try
                {
                    tokenSource.Cancel();
                    task.Wait();
                }
                catch (AggregateException)
                {
                    record.Stop();
                    record.Release();
                    ws.Close();
                    task.Dispose();
                    Console.WriteLine("Task Cancelled.");
                }

            }
        }
    }
    
}