# 第15章 コンテナと実行環境

- Part: Part 4: 実行環境と運用
- 動画: https://www.youtube.com/watch?v=0En-JTVTZ0o
- 課題: [../assignments/chapter15-containers/](../assignments/chapter15-containers/)
- テキスト資料: [../textbook/](../textbook/)

## このファイルについて

このファイルは、研修動画のナレーション台本を公開用に整理したものです。
受講者は動画視聴後の復習、聞き逃した箇所の確認、AIへの質問時の根拠として使えます。

## 台本

### Slide 01. コンテナと実行環境

第15章では、コンテナと実行環境を扱います。ここでの目的は、Dockerコマンドをたくさん暗記することではありません。自分のWebアプリケーションとDBが、何を前提に動くのかを整理し、他の人の環境でも再現しやすく起動できるようにすることです。支援ステータス機能を含む研修用アプリを、Docker Composeで動かす流れを見ていきます。

### Slide 02. この章で持ち帰ること

この章でできるようになることは三つです。一つ目は、アプリはコードだけでは動かず、ランタイム、依存関係、DB、環境変数、portが必要だと説明できることです。二つ目は、imageを作る段階とcontainerを起動する段階を分けることです。三つ目は、ローカルで動いた設定と本番で必要な設定の違いを説明することです。

### Slide 03. 前章までとの接続

第5章では、手元の開発環境や依存関係を確認しました。第10章ではDBを設計しました。第11章から第14章では、API、画面、テスト、セキュリティを扱いました。第15章では、作った機能と確認観点を、他の人も起動できる実行環境にまとめます。環境変数や依存関係、秘密情報の扱いも、動かす場所が変わると見直しが必要です。

### Slide 04. Kubernetesは扱わない

この章では、Kubernetesやクラウド実行基盤の詳しい話には入りません。まず使うのは、imageの作り方を書くDockerfileと、appとDBを一緒に起動するDocker Composeです。volumeやnetworkなどの言葉は、あとで順番に出てきます。大規模運用より先に、ローカルで再現して起動し、設定の違いを自分の言葉で説明できるようにします。

### Slide 05. 実行環境をそろえる理由

実務では、手元では動くのに他の人の環境では動かない、という問題がよく起きます。原因は、Node.jsやPythonのバージョン、依存関係、DB、環境変数、port、ファイルの置き場所など、コード以外にあります。コンテナは、アプリの実行に必要な環境をまとめて扱いやすくします。流行だから使うのではなく、再現しやすくするために使います。

### Slide 06. imageとcontainer

Dockerを理解するときは、imageとcontainerを分けます。imageは、アプリを実行するためのテンプレートです。containerは、そのimageから起動した実行中のプロセスです。Dockerfileにimageの作り方を書き、buildでimageを作り、runでcontainerを起動します。同じimageから複数のcontainerを起動できる、という関係です。

### Slide 07. Dockerfileの役割

Dockerfileは、imageの作り方を記録するファイルです。base image、作業ディレクトリ、依存関係のinstall、アプリのcopy、build、起動commandを書きます。動けばよいスクリプトではなく、あとから見た人が実行環境を再現するためのメモにもなります。秘密情報をimageに入れない、という点もここで意識します。

### Slide 08. 実行前提の棚卸し

Dockerfileを書く前に、アプリが動くために必要なものをメモします。まず、使う言語やバージョン、依存関係のファイル、起動コマンドを確認します。次に、DB、環境変数、公開するport、残したいデータを確認します。先に言葉にしておくと、あとから当てずっぽうで設定を直す回数が減ります。

### Slide 09. build contextと.dockerignore

build contextは、imageを作るときにDockerへ渡すファイルの範囲です。何でも入れてよいわけではありません。不要なファイル、.git、node_modulesのような依存ディレクトリ、生成物、ログ、.envなどは、.dockerignoreで除外します。特に秘密情報をbuild contextやimageに含めないことは、第14章の秘密情報チェックとつながります。

### Slide 10. 開発用と本番用

開発用のcontainerでは、ソースコードをmountして変更をすぐ反映したり、debug logを多めに出したりすると便利です。一方、本番用imageでは、開発中だけ使うパッケージやデバッグ用の道具、秘密情報、過剰な権限を減らします。ローカルで便利な設定と、本番で安全で再現しやすい設定は同じではありません。違いを説明できることが大事です。

### Slide 11. Docker Compose

Docker Composeは、複数のcontainerを一緒に起動するための仕組みです。研修用アプリでは、app serviceとdb serviceを定義します。docker compose upでまとめて起動し、同じCompose networkの中で接続できます。Compose fileは、コマンドを短くするためだけでなく、アプリとDBの関係を明示する資料にもなります。

### Slide 12. app service

app serviceには、Webアプリケーションの起動方法を書きます。どのimageを使うか、またはどのDockerfileからbuildするか。どのcommandで起動するか。どのportを公開するか。DB_HOSTやDB_USERのような環境変数をどう渡すか。ここでは、アプリがDBへ接続するために必要な設定を、見える形にします。

### Slide 13. db service

db serviceには、データベースのimage、環境変数、port、volumeを書きます。DBのデータはcontainerを作り直しても残したいので、volumeを使います。注意したいのは、DBが起動した直後に、すぐ接続できるとは限らないことです。つながらないときは、ログでDBの準備完了を確認し、app側が待てているかを見ます。

### Slide 14. service名で接続する

Composeの中では、service名が接続先の名前として使えます。DB serviceの名前が db なら、appからは DB_HOST=db と指定します。localhost と書きたくなる場面がありますが、containerの中の localhost はそのcontainer自身です。app containerからdb containerへ行くなら、service名を使います。

### Slide 15. port mapping

port mappingは、host側のportとcontainer側のportをつなぐ設定です。たとえば自分のPCの3000番にアクセスしたら、app containerの3000番へ届くようにします。ここで混乱しやすいのは、host側とcontainer側のportを同じものだと思い込むことです。どちら側のportを見ているのかを分けて確認しましょう。

### Slide 16. volume

containerの中のファイルは、containerを作り直すと消えることがあります。DBのデータやアップロードファイルのように残したいものには、volumeを使います。開発時にソースコードをmountすることと、DBデータを永続化するvolumeは目的が違います。volumeを消す操作はデータを消す操作なので、演習環境でも慎重に扱います。

### Slide 17. 環境変数

環境変数は、環境ごとに変わる設定を渡すために使います。DB_HOST、DB_USER、DB_NAME、APP_PORTのような値です。.envは便利ですが、秘密情報を含む場合はGitにcommitしません。.env.exampleには、必要な変数名と例の値を書きます。ここではまず、通常の設定値と秘密情報を分けて考えましょう。build時と起動時の違いは、あとで確認します。

### Slide 18. 秘密情報

第14章と同じく、秘密情報の扱いは重要です。DB password、SESSION_SECRET、API tokenをDockerfileやimageに入れない。ログに出さない。AIへの入力にも含めない。.envを使う場合も、.gitignoreに入っているか確認します。本番のsecret管理は第16章で扱いますが、この章でも、何をGitに入れてよいかを分けて書きます。

### Slide 19. 起動確認

Composeを書いたら、docker compose upで起動します。ここで見るのは、起動したかどうかだけではありません。app serviceとdb serviceが期待どおり立ち上がっているか。アプリがDBへ接続できているか。必要ならmigrationやseedが実行されているか。確認結果をcontainer-run-log.mdに残します。

### Slide 20. ログ確認

containerが起動しないときは、まずログを見ます。docker compose logsでserviceごとのログを確認できます。DB接続失敗、環境変数不足、port競合、依存関係不足、migration未実行など、原因候補をログから分けます。勘で設定を変え続けるより、観察したこと、原因の仮説、直したことを順に記録する方が早くなります。

### Slide 21. container内で調査

必要なときは、docker compose execで起動中のcontainerの中に入り、環境変数、ファイル配置、接続先を確認します。ただし、containerの中で手作業で直して終わりにしないようにします。手で直した内容は、Dockerfile、Compose file、環境変数、migrationなど、再現できる設定に戻して記録します。

### Slide 22. よくある失敗

よくある失敗には、DB_HOSTをlocalhostにしている、portが他のプロセスと競合している、.envが読み込まれていない、lock fileと依存関係がずれている、DBが起動前にappが接続している、migrationを忘れている、などがあります。失敗は悪いことではありません。ログと設定を見比べて、どの前提が外れているかを見つける練習です。

### Slide 23. コンテナ利用時のセキュリティ

コンテナを使っても、セキュリティ問題が自動で消えるわけではありません。imageに秘密情報を入れない。不要なファイルを含めない。base imageや依存関係を更新する。containerに過剰な権限を与えない。開発用のdebug portや管理UIを本番で公開しない。第14章のsecrets-and-dependencies-checkとつなげて確認します。

### Slide 24. ローカルと本番の差分

ローカルで動いたことは、出発点です。ローカル、staging、本番では、設定、データ、秘密情報、ログ、network、永続化、domain、TLSが違います。同じimageを使い、環境ごとの設定を外から渡すと、差分を管理しやすくなります。本番データをローカルに安易に持ち込まないことも大切です。

### Slide 25. AIにCompose案を頼む

AIには、Dockerfile案、Compose案、.dockerignore案、起動失敗ログの原因候補を出してもらえます。入力前には、.envやsecretを含めないか確認します。採用前には、使っている言語、package manager、DB、port、環境変数が既存READMEや実行結果と合っているか見ます。PR前には、公式ドキュメントとログで確認し、自分が説明できる設定だけを残します。

### Slide 26. 個人開発課題への接続

個人開発課題では、自由テーマであっても、他の人が起動できる実行環境が必要です。ここで作るメモは、第16章のデプロイ準備と最終発表で使います。runtime-requirements、dockerfile-note、compose-servicesには、前提、imageの作り方、appとDBのつなぎ方を残します。run-logとenvironment-differencesは、動かした証拠と環境差分を説明する材料です。

### Slide 27. Exercise 1

一つ目の演習では、実行前提を棚卸しします。最初に書くのは、使う言語とバージョン、DB、環境変数、公開するportです。余裕があれば、依存関係ファイル、lock file、install、build、startのコマンド、残したいデータも足します。Dockerfileを書く前に、アプリが何を必要としているかを言葉にしましょう。成果物は runtime-requirements.md です。

### Slide 28. Exercise 2-3

二つ目の演習では、Dockerfile方針を書きます。Dockerfileは、appのimageをどう作るかの土台です。どのbase imageから始め、依存関係をどう入れ、どう起動するかを決めます。三つ目の演習では、ComposeでappとDBをつなぎます。service名、port、volume、環境変数を確認します。成果物は dockerfile-note.md と compose-services.md です。

### Slide 29. Exercise 4-5

四つ目の演習では、起動確認とログ確認を記録します。docker compose up、logs、execで見たこと、原因の仮説、直したことを書きます。これは、詰まったときにメンターへ相談する材料になります。五つ目の演習では、ローカル、staging、本番の差分を書きます。成果物は container-run-log.md と environment-differences.md です。

### Slide 30. 第16章への接続

次の第16章では、クラウドとCI/CDを扱います。詳しい定義は次章で扱うので、ここでは、変更を検証して、利用者が使える環境へ届ける流れだと押さえてください。第15章で、実行前提、Dockerfile、Compose、環境差分を整理しておくと、クラウドに進むときに、何をどこへ渡すのかを説明しやすくなります。
