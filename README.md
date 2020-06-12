# UsaCon 

A browser extension for using SakuraCloud CLI in the control panel.

[さくらのクラウド](https://cloud.sakura.ad.jp)のコントロールパネル上でCLIである[Usacloud](https://github.com/sacloud/usacloud)を
利用できるようにするChrome拡張です。  
WebAssemblyを利用しており別途サーバを必要とせずにブラウザだけでUsacloudコマンドが実行可能になります。

![UsaCon Overview](images/overview.png)

## Install

### From Chrome Web Store

**TODO ストアに公開したら追記**

### From source (for a developer)

1: ブラウザ拡張のビルド

```
$ git clone https://github.com/sacloud/usacon.git
$ cd usacon
$ make tools release-build

# ./dist配下にファイル一式が出力される
```

2: Chromeへインストール

- Chromeで`chrome://extensions`を開く
- `パッケージ化されていない拡張機能を読み込む`をクリック
- 1で出力された`dist`ディレクトリを指定

## Usage

UsaConはさくらのクラウドのコントロールパネルのうち、IaaS部分でのみ利用可能です。  
具体的には`https://secure.sakura.ad.jp/cloud/iaas`を開いている場合が対象となります。

### コンソールの表示

ブラウザ右上に表示されているのUsaConのブラウザ拡張アイコンをクリックするとコンソールの表示/非表示が切り替わります。

![Open/Close](images/open-close.png)

### APIキーの登録

`Add API Key`ボタンをクリックするとAPI入力画面が表示されます。
![Add API Key](images/add-api-key.png)

入力して`Save To The Browser`ボタンをクリックするとブラウザにAPIキーを保存するダイアログが表示されます。

![Save API Key](images/save-api-key.png)

** Note: もしダイアログが表示されない場合はURLバーの右側の鍵アイコンをクリックすると表示されることがあります **

### APIキーの選択

`Choose API Key`ボタンをクリックするとブラウザに保存済みのAPIキーの選択ダイアログが表示されます。

![Choose API Key](images/choose-api-key.png)

** Note: 既に`secure.sakura.ad.jp`でログインパスワードなどを保存済みの場合、APIキー以外も表示されることがあります。 **

**注意: 現在コントロールパネルにログインしているアカウント以外のアカウントのAPIキーも(登録されていれば)表示されます。**

### APIキーの選択解除

APIキーを選択した状態だと保存時に指定したAPIキーの名前がツールバーに表示されています。  
APIキーの名前をクリックすることで選択解除が行えます。

![Unselect API Key](images/unselect-api-key.png)

### コンソールの操作

#### コマンド

以下のコマンドが利用可能です。

- `usacloud`
- `jq`
- `echo`
- `env`
- `wc`
- `clear` or `cls`

#### パイプの利用

以下のようにパイプが利用可能です。

```sh
$ usacloud auth-status show -o json | jq .
```

#### キーボードショートカット

bash風のキーボードショートカットが利用可能です。

- `↑` または `↓`: ヒストリーの表示
- `tab`: (未実装) オートコンプリート
- `ctrl + c`: 実行中のコマンドの終了
- `ctrl + z`: 実行中のコマンドの中断(現在は`ctrl + c`と同等の処理)
- `ctrl + l`: 画面のクリア

- `ctrl + a`: カーソルを行頭へ移動
- `ctrl + e`: カーソルを行末へ移動
- `ctrl + b`: カーソルを1文字前へ移動
- `ctrl + f`: カーソルを1文字後ろへ移動


## License

  `usacon` Copyright (c) 2020 The UsaCon Authors.

  This project is published under [GNU AFFERO GENERAL PUBLIC LICENSE Version 3](LICENSE).

