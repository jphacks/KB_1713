// 環境設定 ===========
// 地図レイヤID
var MAP_LAYER_ID = "MAP_LAYER";
var RASTER_LAYER_ID = "RASTER_LAYER";

// データ配信システムCGIURL
var mapServerURL = "https://map.labs.goo.ne.jp/vector/getTile.do";
// styleURL
var mapStyleURL = "https://map.labs.goo.ne.jp/asset/style/GEOTENANT3_svg.json";

// 地図定義 ==========
// 背景地図層 ----------
var nttMapLayer = new NttMapLayer(
    // 地図定義オブジェクト(NttMapConfig)
    {
        // 地図定義の識別子(利用する地図ID)
        id: "GEOTENANT3",
        // 縮尺分母(最小,最大)
        minScale: 1,
        maxScale: 30000000,
        // 地図の提供範囲
        areas: [new NttBoundary(-648000000, -324000000, 648000000, 324000000)],
        // 地図データの図式
        schemes: [
            //{level: 13, minScale: 8532, maxScale: 17062},
            {level: 14, minScale: 4267, maxScale: 8531},
            {level: 15, minScale: 2134, maxScale: 4266},
            {level: 16, minScale: 62, maxScale: 2133}
        ],
        dataType: 1
    },
    // データ配信システムCGI
    mapServerURL,
    // 地図スタイル定義URL
    mapStyleURL,
    // 地図レイヤオプション
    {}
);




//let initPos = [35.681167,139.767052];

// 地図表示 -----------
$(function () {
    
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    function successCallback(position) {
        let initPos = [position.coords.latitude,position.coords.longitude];
    

    // 画面サイズ
        var width = $(".inbox").width();
        var height = screen.availHeight;

    const pos = { x : initPos[0]* 3600000, y : initPos[1]* 3600000};

    console.log(pos.y);    
    // NttMapオブジェクトの初期化 ----------
    var nttMap = new NttMap(
        // DOM要素(DOMElement)
        document.getElementById("map-canvas"),
        // 背景地図のベクタ地図定義(NttMapLayer)
        nttMapLayer,
        // 地図オプションオブジェクト(NttMapOptions)
        {
            // 初期位置(神戸)
            center: new NttPoint(pos.y, pos.x),
            // 初期縮尺
            //scale : 2000,
            scale: 4265.45916711,
            // 水平方向角度
            rotationAngle: 0,
            // 垂直方向角度
            tiltAngle: 0,
            // 垂直方向角度(最大)
            maxTiltAngle: 45,
            // 縮尺分母(最小,最大)
            minScale: 1067,
            maxScale: 559082264,
            // 地図画面のピクセルサイズ(幅,高)
            size: new NttSize(width, height),
            // 地図中心マーク
            centerMark: true,
            // 解像度
            ppi: 96,
            // レンダリングエンジン(WebGL:1,Canvas:2)
            renderingType: 1,
            retinaMode: (window.devicePixelRatio >= 2 ? true : false)
        }
    );


    //-------------------------------------------------------
    // ラスタ表示
    //-------------------------------------------------------
    var rasterServerURL = "https://map.labs.goo.ne.jp/raster";
    // ラスタ地図インスタンス生成
    var rasterLayer = new NttRasterLayer(
        {
            layer: "RAST3_2016_allpref_grp1",
            format: "png",
            minScale: 62,
            maxScale: 300000000,
            schemes: [
                {level: 5, minScale: 8192001, maxScale: 32768000},
                {level: 7, minScale: 2048001, maxScale: 8192000},
                {level: 9, minScale: 512001, maxScale: 2048000},
                {level: 11, minScale: 128001, maxScale: 512000},
                {level: 13, minScale: 32001, maxScale: 128000},
                {level: 14, minScale: 8001, maxScale: 32000},
                {level: 16, minScale: 62, maxScale: 8000}
            ]

        },
        rasterServerURL,
        {
            opacity: 1.0
        }
    );
    var rasterServerURLOSM = "https://map.labs.goo.ne.jp/osm/raster_image_osm.php";
    var osmLayer = new NttRasterLayer(
        {
            layer: "OSM",
            format: "png",
            dimension: "authorizeKey",
            minScale: 8532,
            maxScale: 279541132,
            schemes: [
                {level: 1, minScale: 139770566, maxScale: 279541132},
                {level: 2, minScale: 69885283, maxScale: 139770566},
                {level: 3, minScale: 34942641, maxScale: 69885283},
                {level: 4, minScale: 17471321, maxScale: 34942641},
                {level: 5, minScale: 8735661, maxScale: 17471321},
                {level: 6, minScale: 4367831, maxScale: 8735661},
                {level: 7, minScale: 2183916, maxScale: 4367831},
                {level: 8, minScale: 1091958, maxScale: 2183916},
                {level: 9, minScale: 545979, maxScale: 1091958},
                {level: 10, minScale: 272990, maxScale: 545979},
                {level: 11, minScale: 136495, maxScale: 272990},
                {level: 12, minScale: 68248, maxScale: 136495},
                {level: 13, minScale: 34124, maxScale: 68248},
                {level: 14, minScale: 17062, maxScale: 34124},
                {level: 15, minScale: 8532, maxScale: 17062}
            ]
        },
        rasterServerURLOSM,
        {
            opacity: 1.0
        }
    );
    // ラスタ地図追加
    nttMap.addRasterLayer(rasterLayer);
    rasterLayer.setVisible(true);
    nttMap.addRasterLayer(osmLayer);
    osmLayer.setVisible(true);

    //-------------------------------------------------------
    //4.4.1.	地図イベントの登録
    //-------------------------------------------------------
    // 地図イベントを登録
    var name = 1;
    nttMap.addEventListener("click",
        function (e) {
        ajax();
            // クリック地点の経度緯度を取得
            console.debug("x", e.pos.x);
            console.debug("y", e.pos.y);

            console.log(e.pos.x);

            var pos = new NttPoint(e.pos.x, e.pos.y);
            // 表示するアイコンやサイズなどの設定
            var markerOptions = {
                color: '#00bfff'
            };

            // マーカーオブジェクトを生成(この時点ではまだ地図上には表示されない)
            nttMarker = new NttEllipse(pos, new NttSize(5, 5), markerOptions);

            var old = nttMap.getGeometryById(name);
            if (old) {
                name += 1;
            }

            // マーカーオブジェクトを地図画面オブジェクト
            nttMap.addGeometry(nttMarker, name);


            //------------------------------------------------------------popup
            var nttPopupWindowOptions = {
                borderColor: "#ffffff"
            };

            var content = (function (param) {
                return param[0].replace(/\n|\r/g, "");
            })`
                    <p style="position:absolute;z-index:2;">危険</p>
                    <div style="width: 100%;height: 100%;background-color: #000;position: absolute;z-index: 1;"></div>
                     `;


            // 吹き出しオブジェクトを生成(この時点ではまだ地図上には表示されない)
            var nttPopupWindow = new NttCustomizePopupWindow(pos, content, {
                "contentStyle": {
                    "z-index": "20",
                    "text-indent": "15px",
                    "font-size": "20px",
                    "line-height": "14px",
                    "color": "#ff4600",
                    "background": "#ff4600",
                    "width": "100px",
                    "height": "50px",
                    "overflow": "hidden",
                },
                "contentOffset": new NttPoint(-40, 93),
                "footerStyle": {
                    "border-top": "40px solid  #000000",
                    "border-right": "20px solid transparent",
                    "border-left": "20px solid  transparent",
                    "width": "0",
                    "height": "100"
                },
                "footerOffset": new NttPoint(-21, 50)
            });
            nttMap.addPopupWindow(nttPopupWindow, name);

        });

    //-------------------------------------------------------
    // ライセンス表記
    //-------------------------------------------------------
    addNttLicense("map-canvas");
        return pos;
    }

    function errorCallback(error) {
        var err_msg = "";
        switch (error.code) {
            case 1:
                err_msg = "位置情報の利用が許可されていません";
                break;
            case 2:
                err_msg = "デバイスの位置が判定できません";
                break;
            case 3:
                err_msg = "タイムアウトしました";
                break;

        }
    }
});

//nttPointに座標変換
function coordinateNtt(latitude, longitude) {
    let position = {};
    position.x = latitude * 1000 * 3600;
    position.y = longitude * 1000 * 3600;
    return position;
}

//test
function test() {
    console.log("ok");
}

//位置情報入手
function getPos() {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    function successCallback(position) {
        let pos = [position.coords.latitude,position.coords.longitude];
        return pos;
    }

    function errorCallback(error) {
        var err_msg = "";
        switch (error.code) {
            case 1:
                err_msg = "位置情報の利用が許可されていません";
                break;
            case 2:
                err_msg = "デバイスの位置が判定できません";
                break;
            case 3:
                err_msg = "タイムアウトしました";
                break;

        }
    }
}
