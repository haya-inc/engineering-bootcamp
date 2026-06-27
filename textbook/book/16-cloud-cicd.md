---
title: "第16章 クラウドとCI/CD"
part: 4
partLabel: "Part 4 実行環境と運用"
order: 16
---

第15章では、DockerfileとDocker Composeで、アプリとDBの実行前提を整理した。
第16章では、その実行環境をクラウドとCI/CDへ接続する。

CIは Continuous Integration の略で、変更を継続的に確かめる流れである。
CDは Continuous Delivery または Continuous Deployment の略で、確かめた変更を環境へ届ける流れである。
略語やYAMLを暗記することが目的ではない。
テスト済みの変更を、どの環境へ、どの権限で、どの確認を通して届け、問題があればどう止めるかを説明できることである。

この章では、標準クラウド環境としてAWSを使う。
ただし、AWSサービス名を広く暗記する章にはしない。
account、region、IAM、network、compute、database、registry、secrets、logs、CI/CDの関係を、支援ステータス機能を含む研修用Webアプリの流れに沿って扱う。

標準のデプロイ先は、研修用にはAmazon ECS（Fargate 起動タイプ）を想定する。
container imageはAmazon ECRに置く。
DBはAmazon RDS for PostgreSQLを想定する。
GitHub ActionsからAWSへは、長期access keyを置くのではなく、OIDCで短期認証情報を借りる方針を基本にする。

枯れて広く使われているAmazon ECS（Fargate 起動タイプ）を標準にする。
ECS（Fargate）は、container imageを起点に、cluster、task definition、service（Fargate 起動タイプ）を作ってWebアプリを動かす。
教材内のECS（Fargate）の説明は、Webアプリ実行環境、image、secret、network、logs、release runbookの関係を学ぶための基準例である。
deploy先は将来変わり得るので、使う時点の公式ドキュメントで提供状況や手順を確認する姿勢は持ち続ける。

この章は、実AWS resourceを必ず作る章ではない。
講師からAWS account、region、予算、削除手順、権限範囲が明示されていない場合は、実resourceを作らない。
その場合でも、構成、workflow、secret、release runbookを「想定手順」として書き、何が未実行かを明記する。
実行していないdeployやsmoke testを、実行済みのように書かない。

### この章でできるようになること

この章を終えると、次のことを自分の言葉で説明し、課題の成果物へ落とせるようになる。

- CIとCDを分け、PR時、main merge時、staging deploy、production deployで何を確認するかを書ける。
- AWSをサービス名の暗記ではなく、実行、image保存、DB、secret、logs、権限、costの役割で整理できる。
- 講師からAWS環境の指定がない場合は、実resource作成ではなく想定手順として扱える。
- ECS（Fargate）、ECR、RDS、Secrets Manager / Parameter Store、CloudWatch Logsの関係を、支援ステータス機能に結びつけて説明できる。
- ECS（Fargate）からRDSへ接続するには、接続情報だけでなくnetwork、security group、タスクを置くsubnetが関係することを説明できる。
- ECR image tagにcommit SHAなど追跡できる値を使い、`latest` だけに頼らない理由を説明できる。
- GitHub ActionsからAWSへ、長期access keyではなくOIDCとIAM roleで短期credentialを使う方針を書ける。
- workflowの `permissions`、IAM trust policy、IAM policy、GitHub Actions environmentを分けて考えられる。
- 通常の設定値、secret、GitHub Actionsだけが使う値、ECS task（コンテナ）が使う値を分けて表にできる。
- deploy後にhealth check、主要画面、API、DB接続、CloudWatch Logsをsmoke testとして確認できる。
- rollback、roll forward、cleanup、未実行事項をrelease runbookへ書ける。

### デプロイは、一回動かす作業ではなく届け続ける流れである

デプロイは、環境で一度動かして終わりの作業ではない。
利用者が使える場所へ、変更を繰り返し届ける作業である。
そのたびに、何を出すのか、何で確認したのか、どこへ出すのか、出した後に何を見るのか、問題があればどう戻すのかを扱う。

手作業だけに頼ると、手順漏れや確認忘れが起きやすい。
テストを実行し忘れる。
古いimageをデプロイする。
secretの反映先を間違える。
stagingで確認していない変更をproductionへ出す。
デプロイ後のログを見ず、利用者からの連絡で初めて気づく。

CI/CDは、この流れをそろえるための仕組みである。
自動化は目的ではない。
変更を確かめ、環境へ反映し、結果を見て、必要なら止めるための作業を、毎回同じ考え方で実行できるようにする。

### CIとCDを分ける

CIは、変更を取り込む前、または取り込んだ直後に、壊れていないかを早く見つける流れである。
Pull Requestでは、install、lint、type check、test、build、必要ならDocker image buildを実行する。
ここで失敗したら、reviewやmergeに進む前に直す。

CDは、確かめた変更をstagingやproductionへ届け、動作を確認する流れである。
imageをbuildする。
ECRへpushする。
ECSへdeployする（新しいtask definitionを登録し、ECS serviceを更新する）。
smoke testを実行する。
CloudWatch Logsを見る。
問題があればrollbackやroll forwardを判断する。

流れは次のように考える。

```txt
Pull Request
  -> CI
    -> lint / test / build
      -> review
        -> merge to main
          -> image build
            -> push to ECR
              -> deploy to ECS (register task definition + update service)
                -> smoke test
                  -> release note / runbook update
```

CIが通っていないものをCDへ進めない。
CDが成功したように見えても、deploy後確認を省略しない。
この二つが基本である。

### AWSをサービス名ではなく役割で見る

AWSには多くのサービスがある。
最初から名前をすべて覚える必要はない。
まず、役割で見る。

- **account**：請求、権限、resourceの大きな境界。
- **region**：resourceを置く地理的な範囲。
- **IAM**：誰が何をできるかを決める仕組み。
- **network**：どことどこが通信できるかを決める境界。
- **ECR**：container imageを置くregistry。
- **ECS（Fargate）**：Webアプリを実行する場所。
- **RDS**：PostgreSQLなどのDBを管理する場所。
- **Secrets Manager / Parameter Store**：secretや設定を置く場所。
- **CloudWatch Logs**：アプリやAWS serviceのログを見る場所。
- **GitHub Actions**：CI/CDの手順を実行する場所。

サービス名だけを線で結んでも、設計説明にはならない。
外部からどこへ入るか。
どこで実行するか。
どこに保存するか。
誰が何を操作できるか。
どこにsecretを置くか。
どこでログを見るか。
何を削除すれば費用が止まるか。
この問いで構成を見る。

### 標準構成を一つの流れとして見る

この章の標準構成は、次の流れである。

```txt
GitHub Actions
  -> OIDC
    -> IAM Role (deploy role)
      -> Amazon ECR
        -> Amazon ECS (Fargate) service
          -> Amazon RDS for PostgreSQL

Amazon ECS (Fargate) task
  -> environment variables (task definition)
  -> Secrets Manager / Parameter Store
  -> CloudWatch Logs
```

GitHub Actionsは、workflowを実行する。
OIDCは、GitHub ActionsがAWSへ短期認証情報を借りるための連携に使う。
IAM role（deploy role）は、借りた認証情報で何をしてよいかを決める。
ECRは、Dockerfileから作ったcontainer imageを置く。
ECS（Fargate）は、そのimageからWebアプリを実行する。具体的には、cluster、task definition、service（Fargate 起動タイプ）を作り、task（コンテナ）を起動する。
RDSは、アプリが使うPostgreSQLを管理する。
Secrets ManagerまたはParameter Storeは、DB passwordやSESSION_SECRETのようなsecretを扱う。
CloudWatch Logsは、デプロイ後のアプリログを確認する場所になる。

この構成は、研修用の標準である。
実務ではEKS、Lambda、Cloud Runのような別の選択肢もあり得る。
ただし本研修では、枯れて広く使われるECS（Fargate）を標準にし、要素を一つずつ理解することを優先する。
別の実行環境へ移すときも、同じimage、port、environment variables、secret参照、health check、logsをどう移すかを考えれば、ここで身につけた見方がそのまま使える。
しかし最初は、1つの標準構成で、役割と流れを説明できることを優先する。

### ECS（Fargate）は、Webアプリを動かす場所である

Amazon ECS（Fargate 起動タイプ）は、container imageからWebアプリを動かすためのAWSのサービスである。
ECS（Fargate）はmanaged serviceに近い性質を持つ。
managed serviceとは、サーバー運用の一部をクラウド側に任せる選択肢である。
Fargateは、コンテナを動かすサーバー（EC2）の管理をAWSに任せ、利用者はcontainer imageとリソース量、ネットワークだけを指定する。
この章では、ECRに置いたcontainer imageを使って、cluster、task definition、service（Fargate 起動タイプ）を作る流れを想定する。

どのcontainer imageを使うか、どのportで受けるか、secretをどこから渡すか、DBへどうつなぐか、deploy後に何を見るかを説明する点は、どの実行環境でも変わらない。

ECS（Fargate）を使えば設計が不要になるわけではない。
次のことは自分たちで決める。

- どのimageを使うか。
- どのportでアプリが待ち受けるか。
- どの環境変数をtask definitionで渡すか。
- secretをどこから参照するか。
- RDSへどう接続するか。
- health checkで何を見るか。
- ログをどこで確認するか。
- stagingとproductionをどう分けるか。

公式ドキュメントでも、ECSのtask definitionにはAmazon ECRのimage URIを指定できる。
また、task definitionでは環境変数やsecret参照を扱う必要がある。
つまり、imageが正しいだけでは足りない。
task definition、secret、network、DB接続、ログまで含めて確認する。

ECRのprivate repositoryをsourceにする場合、ECSがimageをpullできる権限が必要になる。
ECSでは、これを**task execution role**が担う。task execution roleは、ECRからのimage pullと、CloudWatch Logsへのログ出力の権限を持つrole（taskに紐づくrole）である。
つまり、GitHub ActionsがECRへpushできる権限（deploy role）と、ECSがECRからpullできる権限（task execution role）は別である。
どちらのroleが、何のために必要かを `aws-architecture-note.md` に分けて書く。

外部公開は、この章では最小構成にする。
Fargateは awsvpc ネットワークモードで動き、各taskは自分のENI（ネットワークインターフェース）を持ってVPCに直接所属する。
そこで、task を public subnet に置き、`assignPublicIp=ENABLED` でpublic IPを割り当て、security group で必要なportを許可すれば、taskのpublic IP（+ port）で直接アクセスできる。
これは学習用の最小公開であり、本番では非推奨である。
本番では正面に ALB（Application Load Balancer）を置き、HTTPS終端、ヘルスチェック、複数taskへの分散を担うのが定石だが、この章では要素を増やさず public IP 直結で進める。

ECS（Fargate）からRDSへ接続する場合は、DB host、user、passwordだけでは足りない。
Fargateは awsvpc モードで各taskがVPCに所属するため、VPC connectorのような別の仕組みは不要である。
代わりに、taskを置くsubnetとtaskのsecurity group、そしてRDS側のsecurity groupがECS taskのsecurity group（PostgreSQLのport）を許可しているかを確認する。
この章ではVPC設計を深掘りしないが、「RDSへつながらない」を環境変数だけの問題として扱わない。
network、security group、DB認証、schemaの状態を分けて見る。

ECSのtask definitionにはコンテナのhealth check（`healthCheck`）を設定できる。
health checkは、container processが起動したかだけでなく、serviceとして使える状態かを見る入口である。
最小公開なのでALBのヘルスチェックではなく、task definitionのコンテナhealth checkで見る。
研修用の `ops-observability-sample` には `/healthz` と `/readyz` がある。
コンテナのhealth checkやsmoke testでどちらを使うか、何を確認しているendpointかを説明する。

### ECRは、どのimageを出したかを追う場所である

ECR、Elastic Container Registryは、container imageを置く場所である。
第15章で作ったDockerfileからimageをbuildし、ECRへpushする。
ECS（Fargate）は、そのimageを使ってアプリを実行する。

あとから追えるtagを付ける。
`latest` だけに頼ると、どの変更がデプロイされたか分かりにくくなる。
commit SHAやrelease tagを使うと、Gitの変更、GitHub Actionsの実行、ECRのimage、ECSのdeployを結びつけやすい。

release runbookには、今回出したimage tagと、直前に動いていたimage tagを残す。
問題が起きたとき、どこへ戻すかを判断する材料になる。

AWSのECRでは、repositoryでimage tag immutabilityを有効にすると、同じtagの上書きを防げる。
すべての環境で必ず有効にする、という単純な話ではないが、productionに出すimageでは「同じtagが後から別imageを指す」状態を避けることが重要である。
少なくとも、release用tagは一度出したら上書きしない方針にする。

ECRの確認では、次を分ける。

- repository名。
- image URI。
- image tag。
- image digest。
- pushしたworkflow run。
- deployしたECS service。
- 古いimageをいつ削除するか。

tagは人が追うための名前であり、digestはimage内容に対応する識別子である。
release runbookにはtagを書き、必要ならdigestも残す。
cleanupでは、ECRに古いimageを残し続けると費用や管理負荷が増えるため、lifecycle policyや削除方針を確認する。

### RDSは、DBを置く場所である

RDS、Relational Database Serviceは、AWSが管理するリレーショナルデータベースである。
この章ではPostgreSQLを想定する。
第10章で設計したschemaと、第15章でローカルDBとして起動した構成を、クラウド側のDBへ接続する前提で考える。

RDS接続で詰まったら、まとめて直そうとしない。
次を分けて確認する。

- DB host。
- port。
- user。
- password。
- database名。
- ECS taskからRDSへ通信できるnetwork（taskを置くsubnet）。
- security group。
- schemaやmigrationの状態。
- stagingとproductionのDBの違い。

DBにつながるには、接続先情報、認証情報、network、DBの準備状態がそろう必要がある。
接続できないという一言だけでは原因は分からない。
どの段階で失敗しているかを、ログと設定から分ける。

security groupは、どこからどこへ通信してよいかを決めるAWSの仮想firewallとして考えると分かりやすい。
RDSのsecurity groupで、ECS taskのsecurity groupからPostgreSQLのportへ入れるようになっているかを見る。
ただし、外部から誰でもDBへ接続できるようにするのは避ける。
「つながらないからDBを公開する」ではなく、必要な通信元だけを許可する。

本番DBに練習用データをそのまま入れないことも重要である。
データは環境ごとに意味が違う。
local、staging、productionでDBを分ける理由は、利用者影響とデータ保護のためでもある。

### Secrets ManagerとParameter Storeは、secretの置き場所である

第15章では、ローカルの `.env` と `.env.example` を分けた。
クラウドでは、`.env` をそのままproductionへ持ち込まない。
DB password、SESSION_SECRET、API keyのようなsecretは、Secrets ManagerやSystems Manager Parameter Storeなどで管理する。

通常の設定値とsecretを分ける。

- **通常値**：`APP_ENV`、`LOG_LEVEL`、`DB_HOST`、`PORT` または `APP_PORT`。
- **secret**：`DB_PASSWORD`、`SESSION_SECRET`、外部API token。

さらに、どこで使う値かも分ける。

- **GitHub Actionsだけが使う値**：`AWS_ROLE_ARN`、`AWS_REGION`、`ECR_REPOSITORY`、`ECS_CLUSTER`、`ECS_SERVICE` など。
- **ECS task（コンテナ）が使う値**：`APP_ENV`、`PORT`、`DATABASE_URL`、secret参照など。
- **RDS接続で使う値**：host、port、database名、user、password、SSL要否など。

GitHub Actionsに必要な値と、アプリ起動時に必要な値を混ぜると、どこで設定すべきか分からなくなる。
たとえば `AWS_ROLE_ARN` はworkflowがAWSへ接続するための値であり、アプリのcontainer内で読む値ではない。
一方で `DATABASE_URL` や `SESSION_SECRET` は、アプリ実行時に必要な値である。

ECS（Fargate）ではtask definitionで環境変数として値を渡せるが、secretの値をそのまま公開文書へ書かない。
Secrets ManagerやParameter Storeを使う場合も、PRや教材成果物に書くのはsecret名、parameter名、ARN、用途、所有者、反映確認であり、値そのものではない。

secretの値そのものは、PR、issue、ログ、スクリーンショット、AI入力に貼らない。
文書には、値ではなく、置き場所、使う場面、確認手順を書く。

secretを変更したら、どの環境へ反映したかを確認する。
stagingには反映したがproductionには反映していない、という状態はあり得る。
その差分を `cloud-config-and-secrets.md` と `release-runbook.md` に残す。

### CloudWatch Logsは、出した後を見る場所である

CloudWatch Logsは、AWS上で動くアプリやserviceのログを見る場所である。
デプロイworkflowが成功していても、アプリの起動後にDB接続エラーが出ていることがある。
ECS serviceは更新されたが、コンテナのhealth checkに失敗していることもある。

deploy後は、ログを見る。
見るときは、時間帯、service、revision、request、error種別を分ける。
第14章と同じく、ログにsecretや個人情報が出ていないかも確認する。

ログ確認は、第17章のオブザーバビリティへつながる。
この章では、深い分析までは行わない。
まず、デプロイ後にどこでログを見て、重大なエラーがないかを確認できる状態にする。

### GitHub Actionsは、いつ何を実行するかの記録である

GitHub Actionsは、リポジトリへの変更をきっかけに、決めた手順を動かす仕組みである。
workflowの中にjobがあり、jobの中にstepがある。
YAMLは、手順を記録する形式であって、目的ではない。

PR時は、変更を取り込む前の検証を行う。
main merge後は、image build、ECR push、staging deploy、smoke testへ進める。
production deployは、必要ならmanual approvalを挟む。

CIのたたき台は、次のように考えられる。

```yaml
name: ci

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - name: Install dependencies
        run: echo "Install command here"
      - name: Run tests
        run: echo "Test command here"
      - name: Build
        run: echo "Build command here"
```

この例は完成品ではない。
プロジェクトのruntime、package manager、test command、build commandに合わせる。
PR時に何を検証し、main merge時に何を追加で実行し、どの失敗で先へ進めないかを決める。

GitHub Actionsの公式actionやversionは更新される。
上の `actions/checkout@v7` は2026年6月時点での書き方の例であり、教材を使う時点で公式のREADMEや既存workflowを確認する。
本番に近いworkflowでは、actionのmajor versionを意図して固定するか、より厳密にcommit SHAで固定するかをチームで決める。
何となく古い例をコピーするのではなく、次を確認する。

- そのactionは現在も保守されているか。
- 使っているversionをなぜ選んだか説明できるか。
- workflowに必要な `permissions` だけを与えているか。
- `contents: write` や広い権限を、理由なく付けていないか。
- secretをログへ出すstepがないか。

### OIDCで、長期access keyを置かない

GitHub ActionsからAWSへ接続するとき、長く使えるAWS access keyをGitHub Secretsへ置く方式を標準にしない。
GitHub Docsでは、OIDCを使うことで、長期credentialを保存せずにクラウドproviderへ接続できることが案内されている。

OIDC、OpenID Connectを使うと、workflow実行時にGitHubがidentity tokenを発行し、AWSがそれを信頼して短期認証情報を渡す構成にできる。
長く置く鍵ではなく、その場で借りる鍵だと考えると分かりやすい。

GitHub Actions側では、OIDC tokenを要求するために `id-token: write` permissionが必要になる。

```yaml
permissions:
  id-token: write
  contents: read
```

AWS側では、GitHubのOIDC providerを信頼し、特定のrepository、branch、environmentなどに絞ってIAM roleを引き受けられるようにする。
誰でも借りられるroleにしてはいけない。
trust policyとIAM policyで、対象と権限を絞る。

OIDCまわりでは、三つを分ける。

| layer | どこに書くか | 何を決めるか |
| --- | --- | --- |
| workflow permissions | GitHub Actions workflow | OIDC tokenを要求するために `id-token: write` を許可する |
| trust policy | AWS IAM role | どのrepository、branch、environmentのworkflowならroleを借りられるかを決める |
| IAM policy | AWS IAM role | roleを借りた後、ECR push、ECS deploy（task definition登録・service更新）、logs参照など何を実行できるかを決める |

`id-token: write` を書いただけでは、AWS上の操作権限は増えない。
逆にIAM policyでECRやECS操作を許可しても、trust policyが広すぎると、想定外のworkflowからroleを借りられる危険がある。
「workflow permission」「誰がroleを借りられるか」「借りたroleで何ができるか」を別々に確認する。

### IAM roleは、最小権限で設計する

IAM roleは、AWSで許可する操作をまとめた役割である。
GitHub Actionsは、このroleを一時的に借りて動く。

roleに与える権限は、必要な範囲に絞る。
たとえばdeploy roleなら、ECRへimageをpushする、新しいtask definitionを登録する（`ecs:RegisterTaskDefinition`）、ECS serviceを更新する（`ecs:UpdateService`）、そしてtaskに紐づくtask execution roleなどをtaskへ渡すための `iam:PassRole`、必要なログを見る、といった操作である。
何でもできる権限を渡すと、workflowや設定が壊れたときの影響が大きくなる。

最小権限は、単に権限を少なくするという意味ではない。
そのworkflowが何をする必要があるかを説明し、その範囲だけを許可することである。
なぜその権限が必要か説明できないIAM policyは採用しない。

trust policyでは、対象repository、branch、environmentを絞る。
production deployに使うroleは、staging deployより強い制約を置くことがある。
GitHub Actions environmentsのrequired reviewersのような仕組みも、production前のmanual approvalに使える。

### stagingとproductionを分ける

stagingは、productionに近い条件で、リリース前に確認する環境である。
localより本番に近く、productionより利用者への影響が小さい。
staging用のECS service、RDS、secret、domain、logsを用意する。

productionは、実際の利用者に影響する環境である。
productionへデプロイするときは、CI結果、変更内容、DBへの影響、secret変更、rollback候補を確認する。
必要ならmanual approvalを入れる。
GitHub Actions environmentsを使うと、staging、productionのような環境名ごとにsecretや承認を分けられる。
production environmentにはrequired reviewersを設定し、mainへmergeされたから即productionへ出るのではなく、人が確認して進める形にできる。
ただし、承認ボタンがあるだけでは安全ではない。
承認前に何を見るかをrunbookへ書く。

local、staging、productionの違いを表にする。

```txt
local:
- Docker Compose
- local .env
- local DB volume

staging:
- ECS (Fargate) staging service
- staging RDS
- staging secrets
- staging public IP (or domain)

production:
- ECS (Fargate) production service
- production RDS
- production secrets
- production domain
- manual approval
```

環境を分ける理由は、手順を複雑にするためではない。
利用者影響、データ、secret、権限、確認の厳しさが違うからである。
stagingでproductionのDB passwordやproduction向けAPI tokenを使わない。
productionのsecretを流用した時点で、stagingの失敗がproductionの事故につながる可能性がある。

### smoke testは、deploy後の最低限確認である

smoke testは、deploy後に基本動作だけを短く確認するテストである。
大きな負荷をかけるものではない。
利用者が使える最低限の状態かを早く見る。

支援ステータス機能なら、次が候補になる。

- health endpointが200を返す。
- 主要画面が表示される。
- 担当受講者一覧が見える。
- 支援ステータス更新APIが想定どおり動く。
- DB接続が成功している。
- CloudWatch Logsに重大な起動エラーがない。

研修用の `ops-observability-sample` なら、まず `/healthz` と `/readyz` の意味を分ける。
`/healthz` はprocessが応答できるかを見る入口である。
`/readyz` は外部からrequestを受ける準備ができているかを見る入口である。
DB接続や依存先を含める設計にする場合、readiness checkにその観点を入れることがある。
どちらをECS（Fargate）のコンテナhealth checkに使うかは、誤検知と見逃しのtrade-offを考えて決める。

最小公開でtaskにpublic IPを直接割り当てている場合、taskが入れ替わるとpublic IPも変わる。
そのため、smoke testの前に、ECS serviceの実行中taskからENI（ネットワークインターフェース）をたどり、現在のpublic IPとportを確認してから `/healthz` や `/readyz` を呼ぶ。

smoke testの記録には、実行時刻、対象URL、期待status、実際のstatus、見たログ、判断を書く。
例として、実URLを公開資料へ書けない場合は次のように残す。

```txt
- command: curl -i <staging-url>/healthz
- expected: HTTP 200
- actual: HTTP 200
- checked log: CloudWatch Logs, app log stream around deploy time
- result: pass
- note: URL and account id are not written in public document
```

smoke testで失敗したら、productionへ進めない。
productionで失敗したら、rollback、roll forward、feature offのどれで対応するかを判断する。
その判断には、事前にrunbookが必要である。

### rollbackは、失敗してから考えると遅い

rollbackは、問題が起きたとき前の正常な状態へ戻すことである。
ただし、すべての変更が簡単に戻せるわけではない。
アプリのimageだけなら前のtagへ戻せることがある。
DB migrationが絡むと、戻しにくいことがある。
データ変換を伴う変更では、roll forwardのほうが現実的な場合もある。

問題時の選択肢は、少なくとも三つに分ける。

- **rollback**：前のimage、前の設定、前の状態へ戻す。
- **roll forward**：戻すより、小さな修正を追加で出して前へ進める。
- **feature off**：feature flagや設定で問題機能を止め、service全体は動かし続ける。

どれが使えるかは、変更内容によって違う。
画面文言だけならrollbackしやすい。
DB schema変更やデータ移行を含む変更では、単純に前のimageへ戻すと、古いコードが新しいschemaを読めないことがある。
release runbookには、戻せる範囲と戻せない範囲を分けて書く。

release runbookには、少なくとも次を書く。

- 今回のimage tag。
- 直前に動いていたimage tag。
- migrationの有無。
- secret変更の有無。
- rollbackできる範囲。
- 戻せない変更。
- 問題時の連絡先。

失敗してから、どれが前のimageかを探しているようでは遅い。
出す前に、戻し方の候補を書く。

### costとcleanupは、クラウド作業の一部である

クラウドでは、作る責任と消す責任がセットである。
RDS、ECS（Fargate）、ECR、CloudWatch Logs、data transferなどは費用が発生することがある。
検証用resourceを放置すると、費用やセキュリティリスクが残る。

研修では、resource名、tag、終了時刻、削除担当、削除対象を決める。
作成前に、account、region、費用見込み、終了後のcleanupを確認する。
講師からAWS環境、予算、削除手順が明示されていない場合、実AWS resourceは作成しない。

cleanupでは、消すものと残すものを分ける。
ECS service / cluster / task definition、RDS instance、ECR image、CloudWatch Logs、IAM role、security group、secret、DNS recordは、費用やリスクの残り方が違う。
RDSは削除前にsnapshotを取るか、演習用なので完全削除するかを講師の方針に合わせる。
CloudWatch Logsはlog groupのretentionを確認する。
ECRは古いimageを残し続けると増え続けるため、lifecycle policyや削除対象を決める。
IAM roleやsecretは、消し忘れると後で何のための権限か分からなくなる。

実行できなかった手順は、実行済みのように書かない。
`未実行`、`想定手順`、`確認が必要なこと` を分ける。
これは誠実さの問題だけでなく、後続作業の安全性に関わる。

### AIは、YAML生成ではなく設計レビューにも使う

AIには、workflow案、AWS構成案、IAM policyのレビュー観点、deploy失敗ログの原因候補、release runbookの抜け漏れ確認を頼める。

ただし、AWSやGitHub Actionsの仕様は変わる。
AI案は、公式ドキュメント、既存README、実行結果、CloudWatch Logs、GitHub Actionsの実行ログで確かめる。
秘密情報、AWS account id、access key、内部URL、productionの接続情報は貼らない。
特に、ECS（Fargate）のtask definition、networking、GitHub Actionsのaction version、OIDC設定、IAM policyは、教材やAIの記憶ではなく、使う時点の公式ドキュメントで確認する。
確認した日付と参照したURLを `cd-workflow-note.md` や `release-runbook.md` に残すと、後から「どの前提で判断したか」を追いやすい。

依頼例は次のように、範囲と制約を明示する。

```txt
研修用WebアプリをAWSへデプロイするCI/CD構成案を作ってください。

前提:
- 第15章でDockerfileとDocker Composeを作成済み
- 標準クラウド環境はAWS
- デプロイ先はAmazon ECS（Fargate 起動タイプ）
- 外部公開はタスクにpublic IPを割り当てる最小構成（ALBは置かない、本番非推奨）
- container imageはAmazon ECRに置く
- DBはAmazon RDS for PostgreSQLを想定
- GitHub ActionsからAWSへはOIDCで接続する
- Kubernetes、EKS、Terraform/CDKの詳細は扱わない
- stagingとproductionを分ける

出してほしいこと:
- aws-architecture-note.md の観点
- ci-workflow-note.md のたたき台
- cd-workflow-note.md のたたき台
- cloud-config-and-secrets.md の観点
- release-runbook.md の観点
- 公式ドキュメントで確認すべき箇所
- 権限、secret、cost、rollbackの注意点
```

AIが出したIAM policyやworkflowを、そのまま採用してはいけない。
権限が広すぎないか。
長期credentialを前提にしていないか。
古いaction versionや古い記法に寄っていないか。
deploy role（ECR push / ECS更新）とtask execution role（ECR pull / logs出力）を取り違えていないか。
ECS（Fargate）のtask definition、networking、費用を見落としていないか。
実行した結果を説明できるか。
この確認を人が行う。

### aws-architecture-note.mdに書くこと

`aws-architecture-note.md` は、AWS構成を役割で整理する文書である。
サービス名だけを並べるのではなく、何を実行し、何を保存し、どこでsecretを扱い、どこでログを見るかを書く。

```md
# AWS Architecture Note

## この章の標準構成

| role | AWS/GitHub service | environment | note |
| --- | --- | --- | --- |
| CI/CD | GitHub Actions | shared |  |
| AWS auth | IAM OIDC provider / IAM role | shared |  |
| account / region | AWS account / region | staging / production | account idは公開資料に書かない |
| image registry | Amazon ECR | shared or per environment |  |
| web app runtime | Amazon ECS (Fargate) | staging / production | cluster / task definition / service を作る |
| task execution role | IAM role | staging / production | private ECRからpullし、CloudWatch Logsへ出力するrole |
| GitHub deploy role | IAM role | staging / production | GitHub ActionsがOIDCで借りるrole。ECR push、ECS更新、PassRole |
| database | Amazon RDS for PostgreSQL | staging / production |  |
| network | awsvpc / subnet / security group | staging / production | taskがENIでVPCに所属。RDSへ到達できるか確認する |
| public access | task public IP (assignPublicIp=ENABLED) | staging / production | 最小公開。本番はALB+HTTPS推奨 |
| config | ECS task definition environment variables | staging / production |  |
| secrets | Secrets Manager / Parameter Store | staging / production |  |
| logs | CloudWatch Logs | staging / production |  |
| health check | /healthz or /readyz | staging / production | container health checkで見る。endpointの意味を書く |
| cleanup | owner / deadline / delete target | staging / production | costを残さない |
```

resource命名、cost、cleanup、判断が必要なことも書く。
実resourceを作っていない場合は、`status: 想定手順` と書く。
実resourceを作った場合は、resource名、region、owner、削除予定日、CloudWatch Logsのlog group、ECR repository、ECSのcluster名 / service名（必要ならservice ARN）を残す。
構成図がなくても、文章と表で役割を説明できれば設計レビューは始められる。

### ci-workflow-note.mdに書くこと

`ci-workflow-note.md` では、deploy前に何を検証するかを書く。
PR時とmain merge時を分ける。
lint、type check、test、build、Docker image buildのうち、何を必須にするかを決める。

```md
# CI Workflow Note

## CIの目的

-

## workflow前提

| item | value | note |
| --- | --- | --- |
| trigger | pull_request / push to main |  |
| action versions |  | 公式READMEを確認した日を書く |
| permissions | contents: read | deployしないCIなら広い権限を付けない |
| secrets used | none / list | PR時に使わないsecretは渡さない |

## PR時に実行すること

| step | command | required | note |
| --- | --- | --- | --- |
| install |  | yes |  |
| lint |  |  |  |
| type check |  |  |  |
| test |  | yes |  |
| build |  |  |  |
| docker build |  |  |  |

## main merge時に実行すること

| step | command | required | note |
| --- | --- | --- | --- |
| install |  | yes |  |
| test |  | yes |  |
| build |  | yes |  |
| docker build |  | yes |  |
```

失敗時に何を止めるかを書く。
CIが失敗しているのに、手動で先へ進める判断を標準にしてはいけない。

### cd-workflow-note.mdに書くこと

`cd-workflow-note.md` では、main merge後、または手動実行で、検証済みの変更をAWSへ届ける流れを書く。
OIDC、IAM role、ECR、ECS（Fargate）、smoke test、rollbackを分ける。
workflowの前に、次を文章で書く。

- ECS（Fargate）の cluster / service / task definition をどう用意するか。
- GitHub Actions environment名。
- productionの場合、required reviewersの有無。
- OIDCで借りるIAM role。
- trust policyで許可するrepository、branch、environment。
- IAM policyで許可する操作。
- image tagと、必要ならimage digestの残し方。
- deploy後に見るhealth endpointとCloudWatch Logs。

```yaml
name: deploy-staging

on:
  push:
    branches:
      - main

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v7

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v6
        with:
          role-to-assume: arn:aws:iam::<AWS_ACCOUNT_ID>:role/<ROLE_NAME>
          aws-region: <AWS_REGION>

      - name: Build image
        run: echo "docker build -t app:${GITHUB_SHA} ."

      - name: Push image to ECR
        run: echo "Login, tag, and push image to ECR"

      - name: Deploy to ECS
        run: echo "Register new task definition revision and update ECS service (rolling update)"

      - name: Smoke test
        run: echo "Call health endpoint"
```

これはたたき台である。
実際のworkflowでは、公式action、AWS CLI、repository名、cluster名、service名、region、権限をプロジェクトに合わせる。
ECSへのdeployは、初学者向けには `aws-actions/amazon-ecs-deploy-task-definition`（新しいtask definitionを登録し、service を更新する）を使う例にしてもよいが、概念として「新revisionを登録してserviceを更新する＝ローリング更新」が伝われば十分である。
公開資料には実AWS account idや内部URLを書かない。
GitHub ActionsがECRへpushしECSを更新するdeploy roleと、ECSがprivate ECRからimageをpullしログを出力するtask execution roleを分けて書く。
必要なrole、container image、port、environment variables、secret参照、logs、health checkを確認する。
例に出てくるaction versionは固定値として暗記せず、利用時点で公式READMEと既存workflowを見て更新する。

### cloud-config-and-secrets.mdに書くこと

`cloud-config-and-secrets.md` では、通常の環境変数とsecretを分ける。
local、staging、productionで、値そのものではなく置き場所と所有者を書く。

```md
# Cloud Config and Secrets

## 通常の環境変数

| name | local | staging | production | owner |
| --- | --- | --- | --- | --- |
| APP_ENV | local | staging | production |  |
| PORT | 4000 |  |  | `ops-observability-sample` は4000で起動する |
| LOG_LEVEL | debug | info | info |  |
| SERVICE_NAME |  |  |  |  |
| APP_VERSION |  |  |  | image tagやcommit SHAと対応させる |

## secret

| name | local | staging location | production location | note |
| --- | --- | --- | --- | --- |
| DB_PASSWORD | .env | Secrets Manager / Parameter Store | Secrets Manager / Parameter Store | 値は書かない |
| SESSION_SECRET | .env | Secrets Manager / Parameter Store | Secrets Manager / Parameter Store | 値は書かない |

## GitHub Actionsだけが使う値

| name | location | note |
| --- | --- | --- |
| AWS_ROLE_ARN | GitHub environment secret or variable | workflowがOIDCで借りるdeploy role。アプリのruntimeには渡さない |
| AWS_REGION | GitHub variable | region名だけならsecretではないが、公開方針に合わせる |
| ECR_REPOSITORY | GitHub variable | repository名またはURI。account idの扱いに注意 |
| ECS_CLUSTER | GitHub variable | ECSのcluster名 |
| ECS_SERVICE | GitHub environment secret or variable | ECSのservice名。公開資料には実値を書かない |

## ECS task（コンテナ）が使う値

| name | source | note |
| --- | --- | --- |
| DATABASE_URL | Secrets Manager / Parameter Store | URL形式ならpasswordを含むためsecretとして扱う |
| DB_HOST / DB_PORT / DB_NAME / DB_USER | environment variables | 分割形式を使う場合 |
| DB_PASSWORD | Secrets Manager / Parameter Store | 値は書かない |
| SESSION_SECRET | Secrets Manager / Parameter Store | 値は書かない |
```

GitHub Actionsだけが使う値、ECS task（コンテナ）が使う値、RDS接続で使う値も分ける。
AI、ログ、PR、issueに貼らないものを明示する。
値を変えたときは、反映対象、反映時刻、再deployの要否、確認したendpoint、CloudWatch Logsで見た結果を書く。

### release-runbook.mdに書くこと

`release-runbook.md` は、deploy前、deploy中、deploy後、問題時、cleanupの手順をまとめる文書である。
deployはworkflow実行だけでは終わらない。

```md
# Release Runbook

## 対象

- repository:
- app:
- environment:
- release version:
- image tag:
- image digest:
- previous image tag:
- release owner:
- status: 実行済み / 想定手順 / 未実行
- official docs checked:

## deploy前チェック

- [ ] CIが通っている
- [ ] 対象branch / tagが正しい
- [ ] workflowのaction versionを確認した
- [ ] GitHub Actions environmentとrequired reviewersを確認した
- [ ] OIDC trust policyとIAM policyを確認した
- [ ] ECR repository、image tag、必要ならdigestを確認した
- [ ] migrationの有無を確認した
- [ ] secret変更の有無を確認した
- [ ] ECS（Fargate）の cluster / service / task definition を確認した
- [ ] subnet / security group / RDS接続条件を確認した
- [ ] rollback候補を確認した
- [ ] costや作業時間の制約を確認した
- [ ] productionの場合、manual approvalの要否を確認した

## deploy中

| step | command or workflow | result | note |
| --- | --- | --- | --- |
| build image |  |  |  |
| push image |  |  |  |
| deploy service |  |  |  |

## deploy後チェック

- [ ] 現在の接続先確認（実行中taskのENI → public IP / port。taskが入れ替わると変わる）
- [ ] health endpoint: `/healthz`
- [ ] readiness endpoint: `/readyz`
- [ ] 主要画面
- [ ] 支援ステータス一覧
- [ ] DB接続
- [ ] CloudWatch Logsのlog group / log stream
- [ ] secretや個人情報がログに出ていないこと

## smoke test log

| check | expected | actual | result |
| --- | --- | --- | --- |
| `curl -i <staging-url>/healthz` | HTTP 200 |  |  |
| `curl -i <staging-url>/readyz` | HTTP 200 |  |  |
| CloudWatch Logs | 起動エラーなし |  |  |

## rollback

- previous image tag:
- previous image digest:
- 戻せない変更:
- rollback / roll forward / feature off の判断:
- 判断者:

## cleanup

| resource | delete or keep | owner | deadline | confirmation |
| --- | --- | --- | --- | --- |
| ECS service / cluster / task definition |  |  |  |  |
| RDS instance / snapshot |  |  |  |  |
| ECR old images |  |  |  |  |
| CloudWatch Logs retention |  |  |  |  |
| IAM role / policy |  |  |  |  |
| Secrets / parameters |  |  |  |  |

## 未実行事項

| item | reason | next confirmation |
| --- | --- | --- |
|  |  |  |
```

runbookは、問題が起きたときに慌てて作るものではない。
出す前に作ることで、何を確認してから進めるかが明確になる。

### クラウドとCI/CDで起きやすい誤解

- AWSサービス名を並べれば構成説明になると考える。役割、データの流れ、権限、ログ、cleanupを書く。
- CIとCDを同じものとして扱う。出す前の検証と、出して確認する流れを分ける。
- CIの失敗を無視して手動で進める。どの失敗で止めるかを決める。
- GitHub ActionsのYAMLを書くことを目的にする。いつ、何を、どの順番で、どの権限で実行するかが重要である。
- 長期AWS access keyをGitHub Secretsへ置く前提にする。OIDCで短期認証情報を借りる方針を基本にする。
- `id-token: write`、IAM trust policy、IAM policyを混同する。tokenを要求する設定、誰がroleを借りられるか、借りた後に何ができるかは別である。
- IAM policyを広くしすぎる。なぜ必要か説明できる権限だけに絞る。
- GitHub ActionsがECRへpushする権限（deploy role）と、ECSがECRからpullする権限（task execution role）を同じものだと思い込む。実行主体が違う。
- `latest` tagだけでdeployする。commit SHAやrelease tagで追えるようにする。
- ECRのtagはいつでも上書きしてよいと思い込む。release用tagは上書きしない方針にする。
- RDSへつながらない原因を環境変数だけだと決めつける。taskを置くsubnet、security group、DB認証、migration状態を分ける。
- DBへつながらないからpublic accessを開ければよいと考える。必要な通信元だけを許可する。
- taskにpublic IPを割り当てる最小公開を本番構成だと思い込む。本番は正面にALBを置き、HTTPS終端・ヘルスチェック・複数taskへの分散を担うのが定石である。
- 古いaction versionを教材やAIからコピーして使う。使う時点で公式READMEや既存workflowを確認する。
- stagingとproductionを同じ扱いにする。利用者影響、データ、secret、承認の重みが違う。
- deploy成功だけで終わる。smoke test、CloudWatch Logs、DB接続、主要画面を見る。
- rollbackを失敗後に考える。previous image tag、digest、戻せない変更、roll forwardやfeature offの候補を事前に書く。
- costとcleanupを記録しない。検証用resourceを放置しない。
- 実行していないAWS作業を、実行済みのようにPRや成果物へ書く。想定手順、未実行、確認が必要なことを分ける。
- AI案を公式ドキュメントや実行結果と照合せずに採用する。

### CI/CDとリリース手順で確認すること

この章では、`aws-architecture-note.md`、`ci-workflow-note.md`、`cd-workflow-note.md`、`cloud-config-and-secrets.md`、`release-runbook.md` を作る。

最初に、第13章で作成したテスト観点、第14章の `secrets-and-dependencies-check.md`、第15章の `runtime-requirements.md`、`dockerfile-note.md`、`compose-services.md`、`container-run-log.md`、`environment-differences.md` を読み直す。
テスト済みの変更、Dockerfile、環境変数、secret、DB、ログ、localとproductionの差分を取り出す。

`aws-architecture-note.md` には、CI/CD、AWS auth、account/region、ECR、ECS（Fargate）、task execution role、GitHub deploy role、RDS、network、subnet、security group、secrets、logs、resource命名、cost、cleanupを書く。

`ci-workflow-note.md` には、PR時とmain merge時に実行するinstall、lint、type check、test、build、docker build、workflow permissions、action version確認、失敗時に止めることを書く。

`cd-workflow-note.md` には、OIDC、workflow permissions、IAM trust policy、IAM policy、allowed repository、allowed branch/environment、GitHub Actions environment、image tag、image digest、ECR push、ECS（Fargate）へのdeploy（task definition登録 + service更新）、staging、production、rollbackを書く。

`cloud-config-and-secrets.md` には、通常の環境変数、secret、GitHub Actionsで使う値、ECS task（コンテナ）で使う値、RDS接続で使う値、AIやログへ貼らない値、secret変更時の反映確認を書く。

`release-runbook.md` には、deploy前チェック、deploy手順、deploy後チェック、smoke test、CloudWatch Logs確認、rollback、roll forward、feature off、cleanup、未実行事項を書く。

実AWS環境を使う場合は、作成前にaccount、region、resource名、費用見込み、終了時刻、削除担当を確認する。
講師からAWS環境、予算、削除手順が明示されていない場合、実AWS resourceは作成しない。
実行できなかった手順は、実行済みのように書かず、未実行、想定手順、確認が必要なことを分けて書く。

### この章の最小到達ライン

第16章は範囲が広い。
AWS、CI/CD、OIDC、IAM、staging、production、rollback、costを一度に完全理解しようとすると、何ができればよいのかが見えにくくなる。
この章の最低限の到達ラインは、実AWS resourceを作ることではない。
次の項目を、自分の言葉で説明できることである。

- 変更は、PRでCIを通してからdeployへ進む。
- CIでは、install、lint、test、buildなど、出す前の確認を実行する。
- CDでは、確認済みのimageやcommitをstagingやproductionへ届ける。
- GitHub ActionsからAWSへは、長期access keyではなくOIDCとIAM roleで短期credentialを使う方針にする。
- ECS（Fargate）でも別の実行環境でも、image、port、secret、network、logs、health checkを分けて確認する。
- RDS接続では、接続情報だけでなくtaskを置くsubnet、security group、DB認証、migration状態を見る。
- deploy後は、health endpoint、主要画面、API、DB接続、CloudWatch Logsをsmoke testで見る。
- 失敗時に、どのimageへ戻すか、roll forwardするか、feature offするか、戻せない変更は何か、誰に相談するかをrunbookに書く。

実AWS環境が用意されていない場合は、`aws-architecture-note.md`、`ci-workflow-note.md`、`cd-workflow-note.md`、`cloud-config-and-secrets.md`、`release-runbook.md` を「想定手順」として作る。
その場合も、実行済みのようには書かない。
未実行の理由、確認できた資料、次に実環境で確認すべきことを明示する。

### クラウドとCI/CDの章で持ち帰ること

第16章で身につけるべきことは、クラウドとCI/CDをサービス名やYAMLではなく、変更を安全に届ける流れとして説明することである。
CIは出す前に確かめる。
CDは確かめた変更を環境へ届け、deploy後に確認する。
AWS構成は、ECR、ECS（Fargate）、RDS、secret、logs、IAM、OIDCを役割で見る。
deploy先は将来変わり得るので、実resourceを作る場合は使う時点の公式資料と講師指定を確認する。
別の実行環境を使っても、container image、task definition、secret、network、logs、health check、cleanupを見る力は同じように使える。

OIDCとIAM roleでは、長期credentialを置かず、必要な権限だけを短期的に借りる方針を基本にする。
stagingとproductionは、利用者影響、データ、secret、承認の重みが違う。
smoke test、CloudWatch Logs、rollback、cost、cleanupまで含めてrelease runbookへ残す。

### オブザーバビリティとSREの章へ

次章では、デプロイ後のシステムをどう観察し、問題が起きたときにどう説明するかを扱う。
第16章でCloudWatch Logsを見たが、リリース後の運用では、ログだけでなくメトリクス、トレース、SLO、アラートも必要になる。
出したあとに見続ける力が、第17章のテーマである。

### 参考資料

- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)
- [Amazon ECS とは](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html)
- [AWS Fargate（Amazon ECS 上）](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html)
- [Amazon ECS: task execution IAM role](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_execution_IAM_role.html)
- [Amazon ECS: Fargate task networking](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-task-networking.html)
- [Amazon ECS: awsvpc network mode](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-networking-awsvpc.html)
- [Amazon ECS: Outbound networking](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/networking-outbound.html)
- [Amazon ECS: Passing sensitive data to a container](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/specifying-sensitive-data.html)
- [Amazon ECS: Use environment files](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/taskdef-envfiles.html)
- [Amazon ECS: Creating a task definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/create-task-definition.html)
- [Amazon ECS: Rolling deployment](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-type-ecs.html)
- [Amazon ECS: Container health checks](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/healthcheck.html)
- [Amazon ECS: Service load balancing（本番でALBを置く場合の概念）](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-load-balancing.html)
- [Amazon ECR: Preventing image tags from being overwritten](https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-tag-mutability.html)
- [Amazon ECS: Tagging your container images](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/container-considerations.html)
- [GitHub Docs: OpenID Connect](https://docs.github.com/en/actions/concepts/security/openid-connect)
- [GitHub Docs: Configuring OpenID Connect in Amazon Web Services](https://docs.github.com/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [actions/checkout](https://github.com/actions/checkout)
- [aws-actions/configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials)
- [Martin Fowler: Continuous Integration](https://martinfowler.com/articles/continuousIntegration.html)
- [The Twelve-Factor App](https://12factor.net/)
