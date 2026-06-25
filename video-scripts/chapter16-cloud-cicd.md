# 第16章 クラウドとCI/CD

- Part: Part 4: 実行環境と運用
- 動画: https://www.youtube.com/watch?v=IoLfMJnyNR8
- 課題: [../assignments/chapter16-cloud-cicd/](../assignments/chapter16-cloud-cicd/)
- テキスト資料: [../textbook/](../textbook/)

## このファイルについて

このファイルは、研修動画のナレーション台本を公開用に整理したものです。
受講者は動画視聴後の復習、聞き逃した箇所の確認、AIへの質問時の根拠として使えます。

## 台本

### Slide 01. クラウドとCI/CD

第16章では、クラウドとCI/CDを扱います。CIは Continuous Integration の略で、変更を継続的に確かめる流れです。CDは Continuous Delivery または Deployment の略で、確かめた変更を環境へ届ける流れです。AWSのサービス名やYAMLを暗記する章ではありません。テスト済みの変更を出し、確認し、必要なら戻せるようにする章です。

### Slide 02. この章で持ち帰ること

この章で持ち帰ってほしいことは三つです。一つ目は、出す前に確かめるCIと、出して確認するCDを分けることです。二つ目は、AWSをサービス名ではなく、置く場所、動かす場所、秘密を置く場所、ログを見る場所として見ることです。三つ目は、リリースを、デプロイ後の確認と戻し方まで含めて考えることです。

### Slide 03. 前章までとの接続

第13章ではテストとコード品質を扱いました。第14章では秘密情報と依存関係を扱いました。第15章ではDockerfileとDocker Composeで、アプリとDBの実行環境を整理しました。第16章では、それらをリリース手順の中で使います。テストで確かめ、コンテナイメージを作り、AWSへ出し、ログと画面で確認します。

### Slide 04. デプロイは届け続けること

デプロイは、一回だけ環境で動かす作業ではありません。利用者が使える場所へ、変更を繰り返し届ける作業です。手作業だけに頼ると、手順漏れや確認忘れが起きやすくなります。CI/CDは、変更を確かめ、環境へ反映し、結果を見る流れをそろえるためのものです。

### Slide 05. CIとCD

CIは、変更を環境へ出す前に確かめる流れです。lint、型チェック、test、buildなどで、壊れていないかを早く見つけます。CDは、確かめた変更をstagingやproductionへ出し、動作を確認する流れです。コンテナイメージを置く、デプロイする、短い動作確認をする、戻す準備をする、という作業が入ります。

### Slide 06. AWSを役割で見る

AWSには多くのサービスがありますが、最初から名前を全部覚える必要はありません。まず、何を分けるためのものかで見ます。アカウントは料金や権限を分ける箱です。リージョンはリソースを置く地域です。IAMは誰が何をできるかを決めます。ネットワークは、どことどこが通信できるかを決めます。

### Slide 07. 標準AWS構成

この研修では、一つのWebアプリをAWSに出す最小構成として見ます。GitHub Actionsが手順を動かし、ECRがイメージ置き場、App Runnerが実行場所、RDSがDBです。秘密情報はSecrets ManagerまたはParameter Store、ログはCloudWatch Logsで見ます。OIDCとIAM roleは、AWSの権限を安全に借りるための仕組みです。名前より、役割の対応を押さえましょう。

### Slide 08. App Runner

App Runnerは、Webアプリを動かすためのAWSの管理サービスです。管理サービスは、サーバー運用の一部をクラウド側に任せる選択肢です。この研修では、第15章で作ったDockerfileとコンテナイメージを使い、App RunnerでWebアプリを動かします。ただし、環境変数、秘密情報、ログ、ドメイン、VPC接続は自分たちで決めます。

### Slide 09. ECR

ECRは、Elastic Container Registryの略で、コンテナイメージを置く場所です。第15章のDockerfileからイメージをbuildし、ECRへpushします。あとから、どの変更を出したか追えることが大事です。latestだけに頼らず、commit SHAのように追えるタグを使い、GitHub Actionsの実行、イメージ、デプロイ先を結びます。

### Slide 10. RDS

RDSは、Relational Database Serviceの略で、AWSが管理してくれるデータベースです。この章ではPostgreSQLを想定します。DBにつながらないときは、host、port、user、password、database名をまず見ます。次に、App RunnerからRDSへ通信できるか、schemaやmigrationが準備できているかを確認します。本番DBに練習用データをそのまま入れないことも大切です。

### Slide 11. Secrets/Parameter Store

本番の秘密情報を、.envのまま持ち込んではいけません。DB password、SESSION_SECRET、API keyのような値は、Secrets ManagerやParameter Storeなどで管理します。通常の環境変数と秘密情報を分けます。秘密の値そのものは、ログ、PR、issue、AIへの入力に貼りません。コードで扱う設定と、外に出してはいけない値を分けて考えます。

### Slide 12. CloudWatch Logs

CloudWatch Logsは、AWS上で動くアプリのログを見る場所です。デプロイが成功したように見えても、アプリの中ではDB接続に失敗していたり、起動後にエラーが出ていたりすることがあります。ログは、デプロイ後の確認と調査に使います。ただし、第14章と同じく、ログに秘密情報や個人情報を出さない設計も必要です。

### Slide 13. GitHub Actions

GitHub Actionsは、リポジトリへの変更をきっかけに、決めた手順を動かす仕組みです。workflowの中にjobがあり、jobの中にstepがあります。YAMLの細かい書き方はあとで確認すれば大丈夫です。まずは、何を、いつ、どの順番で行うかを考えます。PR時は検証、mainにmergeした後はbuildやデプロイ、というように役割を分けます。

### Slide 14. PR時のCI

Pull Request、つまり変更を取り込む前の確認では、CIを動かします。install、lint、型チェック、test、buildなどです。ここで失敗したら、reviewやmergeに進む前に直します。PR時のCIは環境を変えるためではなく、変更が壊れていないかを早く見つけるためのものです。第13章で作ったテスト観点がここで効いてきます。

### Slide 15. main merge時のCI/CD

main branchへmergeされた後は、必要な検証をもう一度行い、イメージをbuildし、ECRへpushし、まずstagingへデプロイします。CIが通っていないものをCDに進めないことが基本です。いきなりproductionへ出すのではなく、stagingで画面、API、ログを確認します。どの段階で失敗したら止めるかも、pipeline設計の一部です。

### Slide 16. OIDC

GitHub ActionsからAWSへ接続するとき、長く使えるアクセスキーをGitHub Secretsに置く方式は標準にしません。OIDC、OpenID Connectを使うと、workflowを実行するときだけ短い時間使える認証情報を借りられます。長く置く鍵ではなく、その場で借りる鍵だと考えてください。漏れたときの被害を小さくし、どのworkflowがどのroleを使ったかも追いやすくなります。

### Slide 17. IAM role

IAM roleは、AWSで許可する操作をまとめた役割です。GitHub Actionsは、このroleを一時的に借りて動きます。たとえば、ECRへpushする、App Runnerをデプロイする、必要なログを見る、といった操作だけを許可します。これが最小権限です。trust policyでは、対象のrepository、branch、environmentを絞り、誰でも借りられるroleにしないようにします。

### Slide 18. image tag

image tagは、どのコンテナイメージかを見分ける名前です。latestだけでは、あとから何がデプロイされたか追いにくくなります。commit SHAやrelease tagを使うと、Gitの変更、CIの実行、ECRのイメージ、App Runnerの更新を結びつけやすくなります。release runbookには、今回出したimage tagと、直前に動いていたimage tagを残します。

### Slide 19. App Runner deploy

App Runnerのデプロイでは、ECRに置いたイメージからWebアプリを更新します。デプロイ操作だけで完了ではありません。新しいrevisionが起動したか、health checkが通るか、主要画面が開くか、APIがDBへつながるかを確認します。環境変数や秘密情報の参照が間違っていると、イメージが正しくても起動や接続で失敗します。

### Slide 20. RDS接続

RDS接続で詰まったときは、まとめて直そうとせず、分けて見ます。まず、DB host、port、user、password、database名です。次に、App RunnerからRDSへ通信できるネットワークとsecurity groupを見ます。さらに、schemaやmigrationが期待どおりかを確認します。接続先情報、通信、DBの状態がそろって初めて接続できます。

### Slide 21. 環境変数

local、staging、productionでは、環境変数の値が違います。localではDocker Composeと.envを使っていても、stagingやproductionではApp Runnerの環境変数や秘密情報の参照を使います。APP_ENVやDB_HOSTのような通常値と、DB_PASSWORDやSESSION_SECRETのような秘密情報を分けます。どこに置くかを表にしておくと、混乱が減ります。

### Slide 22. secret管理

秘密情報の管理では、置き場所だけでなく、誰に共有するかも確認します。Gitにcommitしない。ログに出さない。PRやissueに貼らない。AIにも貼らない。値そのものではなく、置き場所、使う場面、確認手順を書きます。GitHub Actionsが使う値、App Runnerで動くアプリが使う値、RDS接続で使う値も分けます。変更した場合は、反映先と確認手順をrelease runbookに残します。

### Slide 23. staging

stagingは、productionに近い条件でリリース前に確認する環境です。localより本番に近く、productionより利用者への影響が小さい場所です。staging用のApp Runner service、RDS、秘密情報、domain、logsを分けます。ここでsmoke testやDB接続、ログ確認を行い、productionへ進めるかを判断します。

### Slide 24. production

productionは、利用者に影響する環境です。productionへデプロイするときは、CI結果、変更内容、DBへの影響、秘密情報の変更、戻す候補を順に確認します。必要ならmanual approval、つまり人による承認を入れます。productionを特別扱いするのは、利用者影響、データ、責任が大きいからです。だから手順を明確にします。

### Slide 25. smoke test

smoke testは、デプロイ後に基本動作だけを短く確認するテストです。health endpointが200を返す。主要画面が表示される。支援ステータス一覧が見える。更新APIが想定どおり動く。DB接続が成功する。大きな負荷をかけるのではなく、利用者が使える最低限の状態かを早く確認するために行います。

### Slide 26. logs確認

デプロイ後は、CloudWatch Logsで重大なエラーが出ていないかを確認します。workflowがgreenでも、アプリの起動後に問題が出ることがあります。ログを見るときは、時間帯、service、revision、request、エラーの種類を分けます。秘密情報や個人情報が出ていないかも同時に見ます。このログ確認が、第17章のオブザーバビリティへつながります。

### Slide 27. rollback

rollbackは、失敗してから考えると遅くなります。直前に動いていたimage tagを記録します。アプリだけ戻せばよい変更もあれば、DB migrationが絡んで戻しにくい変更もあります。rollback、roll forward、feature offの違いは、ここでは軽く知っておけば大丈夫です。個人開発課題では、戻す候補と戻せない変更を書ければ十分です。

### Slide 28. costとcleanup

クラウドでは、作る責任と消す責任がセットです。RDS、App Runner、ECR、ログ、data transferなどは費用が発生することがあります。研修では、命名規則、タグ、削除手順、終了時刻を決めます。不要なリソースを残さないようにします。費用アラートや請求画面の確認は講師側でも用意し、受講者もcleanupをrelease runbookに書きます。

### Slide 29. AIにCI/CD案を頼む

AIは、workflow案、AWS構成案、IAM policyのレビュー観点、デプロイ失敗ログの原因候補を出すのに使えます。ただし、AWSやGitHub Actionsの仕様は変わります。AI案は、公式ドキュメント、既存README、実行結果、ログで確かめます。秘密情報、AWS account id、アクセスキー、内部URLは貼りません。なぜその権限が必要か説明できないIAM policyは採用しません。

### Slide 30. Exercise 1-2

一つ目の演習では、AWS構成を役割で整理します。アプリを動かす場所、イメージを置く場所、DB、秘密情報、ログ、CI/CD、cleanupを対応づけます。成果物は aws-architecture-note.md です。二つ目の演習では、CI workflowを設計します。PR時とmain merge時に何を検証し、失敗したら何を止めるかを書きます。成果物は ci-workflow-note.md です。

### Slide 31. Exercise 3-4

三つ目の演習では、CD workflowを書きます。OIDCで権限を借り、ECRへイメージを置き、App Runnerへデプロイし、smoke testで確認する流れです。四つ目の演習では、環境変数と秘密情報を表にします。local、staging、productionごとに、通常値、秘密情報、貼らない値を分けます。成果物は cd-workflow-note.md と cloud-config-and-secrets.md です。

### Slide 32. Exercise 5と第17章への接続

五つ目の演習では、release runbookを書きます。デプロイ前、デプロイ中、デプロイ後、smoke test、ログ確認、rollback、cleanupを手順にします。成果物は release-runbook.md です。次の第17章では、デプロイしたアプリを観察し、ログ、メトリクス、トレース、信頼性の見方へ進みます。出したあとに見続けるための章へつながります。
