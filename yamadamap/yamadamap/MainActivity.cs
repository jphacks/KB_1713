using Android.App;
using Android.Widget;
using Android.OS;
using Android.Webkit;
using static Android.Content.PM.LauncherApps;
using Android.Locations;
using Android.Content;
using Android.Runtime;
using System;
using static Android.Views.View;
using yamadamap.Services;

namespace yamadamap
{
    [Activity(Label = "Otto! Map", MainLauncher = true, Icon = "@drawable/icon")]
    public class MainActivity : Activity
    {
        LocationManager locationManager;

        const int LOCATION_ENABLE_REQUEST = 1;

        protected override void OnCreate(Bundle bundle)
        {
            base.OnCreate(bundle);
            

            SetContentView (Resource.Layout.Main);

            CheckLocationEnabled(() => {
                Intent intent = new Intent(Android.Provider.Settings.ActionLocationSourceSettings);
                Toast.MakeText(this.ApplicationContext, "位置情報をオンにしてください", ToastLength.Short).Show();
                StartActivityForResult(intent, LOCATION_ENABLE_REQUEST);
            });

            var mapView = FindViewById<WebView>(Resource.Id.mapView);

            mapView.SetWebChromeClient(new GeolocationEnabledWebChromeClient());

            mapView.Settings.SetGeolocationEnabled(true);
            mapView.Settings.JavaScriptEnabled = true;


            mapView.LoadUrl("file:///android_asset/geo.html");

            var toggleButton = FindViewById<ToggleButton>(Resource.Id.recToggle);
            toggleButton.Click += (sender, e) =>
            {
                Console.WriteLine("===========================================");
                if (((ToggleButton)sender).Checked)
                {
                    StartService(new Intent(this.ApplicationContext,typeof(SendSoundService)));
                }
                else
                {
                    StopService(new Intent(this.ApplicationContext, typeof(SendSoundService)));
                }
                Toast.MakeText(this.ApplicationContext, "" + toggleButton.Checked, ToastLength.Short).Show();
            };

        }
        
        private void CheckLocationEnabled(Action order)
        {
            if(locationManager == null) locationManager = (LocationManager)GetSystemService(LocationService);
            bool gpsEnabled = locationManager.IsProviderEnabled(LocationManager.GpsProvider);
            if (!gpsEnabled)
            {
                order();
            }
        }

        protected override void OnActivityResult(int requestCode, [GeneratedEnum] Result resultCode, Intent data)
        {
            switch (requestCode)
            {
                case (LOCATION_ENABLE_REQUEST):
                    CheckLocationEnabled(()=>{
                        Toast.MakeText(this.ApplicationContext, "このアプリでは位置情報が必要です", ToastLength.Short).Show();
                        this.Finish();
                    });
                    break;
                default:
                    break;
            }
        }
    }
    
    class GeolocationEnabledWebChromeClient : WebChromeClient
    {
        public override void OnGeolocationPermissionsShowPrompt(string origin, GeolocationPermissions.ICallback callback)
        {
            callback.Invoke(origin, true, false);
        }
    }
}

