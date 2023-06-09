# CDK Pipelines

CDK Pipelines is an open-source framework designed to make it easier for developers to build continuous delivery pipelines in AWS. It is built on top of the AWS Cloud Development Kit (CDK), which is a software development framework that enables developers to define infrastructure as code using familiar programming languages like TypeScript, Python, and Java.

With CDK Pipelines, developers can define and manage their deployment pipelines in code, just like any other AWS infrastructure. This means that developers can take advantage of the same tools and workflows they use to manage their application code, including version control, code review, and automated testing.

CDK Pipelines provides a set of high-level constructs that simplify the process of creating and managing pipelines, including stages, actions, and approvals. Developers can use these constructs to define the steps that make up their pipeline, such as building and testing their application, deploying it to a staging environment, and promoting it to production.

One of the key benefits of CDK Pipelines is that it is fully integrated with AWS CodePipeline, which is a managed service that automates the building, testing, and deployment of applications. This means that developers can easily integrate their pipeline with other AWS services like AWS CodeBuild and AWS CodeDeploy, and take advantage of features like automatic scaling and deployment monitoring.

Overall, CDK Pipelines is a powerful tool that simplifies the process of building and managing continuous delivery pipelines in AWS. With its intuitive API and tight integration with AWS services, developers can focus on delivering high-quality applications without worrying about the underlying infrastructure.

# Getting started

![Architecture](/docs/AWS-architecture.png)

Ensure your Node.js version is >=18 with `node -v`. If not, it's time to upgrade for which I recommend `nvm`.

## Prerequisites

_The tutorial is authored using cli on MacOS Z shell. Some steps or commands may be different depending on your OS environment._

1. Clone respository

```
   git clone https://github.com/knowit-finland-javascript-guild/cdk-pipelines.git
```

2. Install dependencies

```
   cd cdk-pipelines
   npm i
   npm test # validate installation
```

3. Install `git-remote-codecommit`

   https://docs.aws.amazon.com/codecommit/latest/userguide/setting-up-git-remote-codecommit.html

## Authenticate session with AWS SSO

1. Browse to MyApps (Knowit)

   - https://myapps.microsoft.com/

   - Choose AWS Sandbox

> If you don't see AWS Sandbox, contact Knowit helpdesk

2. Expand the `Knowit - Solutions Cloud - Sandbox` container

3. Click `Command line or programmatic access`

4. Open (VSCode) terminal and paste AWS credentials from Option 1

5. Set default region

   `export AWS_REGION=eu-north-1`

6. Validate session

   `aws sts get-caller-identity`

   > Valid response contains a JSON object with UserId, Account and Arn

# Workshop Steps

**Replace `n00b` username placeholder with your own**

## 1. Deploy Hello World app

> Start here: `git switch step-1`

Deploy app

```
   npx cdk deploy --context username=n00b n00b-app-hello
```

After deployment, see Outputs section

```
   n00b-app-hello.HelloApiEndpoint91438085 = https://nf2azokp2g.execute-api.eu-north-1.amazonaws.com/prod/
```

Browse to the output URL and see `Hello world`

## 2. Deploy pipeline for Hello World

```
   npx cdk deploy --context username=n00b n00b-pipeline-hello
```

View your CodePipeline in AWS console

https://eu-north-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/

## 3. Push changes to CodeCommit repository

1.  Add git remote from Output

```
   git remote add pipeline codecommit::eu-north-1://n00b-pipeline-hello
```

2.  Make initial commit to start pipeline

```
   git push -f pipeline $(git branch --show-current):master
```

3.  Wait for pipeline to finish deployment to staging...

4.  Visit the staging site and see `Hello world`

Find the staging site URL from AWS Console > CloudFormation > Staging-myname-hello > Outputs

![Outputs](/docs/Staging-n00b-hello.png)

## 4. Add test step before deploying

1.  Add test step in `CdkPipelineStack.ts`

```
private addTests() {
  this.stagStage.addPre(
    new ShellStep("Hello.Test", {
      commands: ["npm ci", "npm test"],
      input: this.source,
    })
  );
}

```

2.  Add init function inside constructor

```
   this.addTests()
```

> Checkpoint: `git switch step-2`

3.  Commit and push changes

```
   git push -f pipeline $(git branch --show-current):master
```

4.  Watch pipeline running tests before staging deployment

Pipeline is running automatically all tests from `/test` folder. Open `HelloStack.test.ts`to see how to make an infra validation test with CDK.

## 5. Add production environment

1.  Add production stage in CdkPipelineStack.ts

```
private addProductionStage() {
  const prodStage = this.pipeline.addStage(new AppStage(this, "Production"));
}
```

2.  Add init function inside constructor

```
   this.addProductionStage()
```

> Checkpoint: `git switch step-3`

3. Commit changes and push to pipeline

4. Wait for pipeline to add production app

5. Visit production app and see `Hello world`

## 6. Add manual approval before production deployment

1. Include step for manual approval inside the production stage function

```
private addProductionStage() {
  const prodStage = this.pipeline.addStage(new AppStage(this, "Production"));

  prodStage.addPre(new pipelines.ManualApprovalStep("Production.Promote"));
}
```

> Checkpoint: `git switch step-4`

2.  Commit changes and push to pipeline

3.  Wait for pipeline to add manual approval step before production deployment

## 7. Update Hello World to V2

1.  Change `Hello world` to `Hello world v2` inside `src/Hello/index.js`

> Checkpoint: `git switch step-5`

2.  Commit changes and push to pipeline

3.  Wait for pipeline pause before production deployment for manual approval

4.  Visit staging app to see `Hello world v2`

5.  Visit production app to see `Hello world` (without v2)

6.  Approve changes and wait for production to update

7.  Visit production app to see `Hello world v2`

That's all folks!

# Clean up

```
   npx cdk destroy --context username=n00b n00b-pipeline-hello n00b-app-hello
```

# Advanced concepts

[Automating Cross-account CI/CD Pipelines Using AWS CDK v2](https://nordcloud.com/tech-community/automating-cicd-pipelines/)
