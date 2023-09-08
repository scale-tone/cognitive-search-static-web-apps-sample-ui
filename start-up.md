## 这个项目使用了以下框架和开发语言：

1. **开发语言**:
   - TypeScript

2. **框架和库**:
   - React (用于构建用户界面)
   - MobX (用于状态管理)
   - Material-UI (React的UI框架)
   - styled-components (用于定义和管理组件样式)
   - Node.js (运行时环境)
   - Azure Functions Core Tools (用于Azure函数开发)
   - axios (用于HTTP请求)
   - Azure Static Web Apps (Azure服务，用于部署静态web应用)

3. **服务和平台**:
   - Azure Cognitive Search (搜索服务)
   - Azure Maps (地图服务)
   - Azure Functions Proxy (函数代理服务)
   - GitHub Actions (用于CI/CD)



## 从设置开发环境到在本地运行应用的详细步骤：

### 1. 设置开发环境

**安装Node.js**:
- 访问[Node.js官方网站](https://nodejs.org/en)下载并安装适合你操作系统的版本。

**安装Azure Functions Core Tools**:
- 打开终端或命令行工具。
- 运行以下命令来全局安装Azure Functions Core Tools：
  ```
  npm i -g azure-functions-core-tools
  ```

### 2. 克隆项目

- 在你希望存放项目的目录中，打开终端或命令行工具。
- 运行以下命令来克隆项目：
  ```
  git clone [项目的Git仓库地址]
  ```

### 3. 安装项目依赖

- 进入项目的根目录：
  ```
  cd [项目目录名]
  ```
- 运行以下命令来安装项目的依赖：
  ```
  npm install
  ```

注意：如果不复制repository的package-lock.json文件的话会出依赖问题，所以在安装之前，将repository上的package-lock.json的内容覆盖本地的项目文件中的文件。

### 4. 配置本地设置

- 在`/api`文件夹下，创建一个名为`local.settings.json`的文件。
- 将以下内容复制到`local.settings.json`文件中，并根据你的Azure Cognitive Search服务进行相应的配置：
  ```json
  {
      "IsEncrypted": false,
      "Values": {
          "FUNCTIONS_WORKER_RUNTIME": "node",
          "AzureWebJobsFeatureFlags": "EnableProxies",
          "SearchServiceName": "azs-playground",
          "SearchIndexName": "hotels",
          "SearchApiKey": "your-search-api-key",
          "AzureMapSubscriptionKey": "your-azure-map-subscription-key",
          "CognitiveSearchKeyField":"HotelId",
          "CognitiveSearchNameField": "HotelName",
          "CognitiveSearchGeoLocationField": "Location",
          "CognitiveSearchOtherFields": "Tags,Description,Description_fr,Category",
          "CognitiveSearchFacetFields": "Tags*,Rating,Category,ParkingIncluded,LastRenovationDate",
          "CognitiveSearchTranscriptFields": "HotelName,Description,Description_fr",
          "CognitiveSearchSuggesterName": "sg"
      },
      "Host": {
          "CORS": "http://localhost:3000",
          "CORSCredentials": true
      }
  }
  ```

### 5. 运行应用

- 在项目的根目录下，运行以下命令启动应用：
  ```
  npm run start-with-backend
  ```

- 上述命令还会编译并在`http://localhost:7071/api`下启动`/api`项目。

- 如果浏览器没有自动打开，手动导航到`http://localhost:3000`查看应用。

以上就是在本地设置和运行项目的步骤。如果在安装或运行过程中遇到任何问题，请随时告诉我，我会尽量帮助你。