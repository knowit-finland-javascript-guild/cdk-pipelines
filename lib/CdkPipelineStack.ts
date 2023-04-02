import { CfnOutput, Stack, StackProps, Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import * as pipelines from "aws-cdk-lib/pipelines";
import { HelloStack } from "./HelloStack";
import { ShellStep } from "aws-cdk-lib/pipelines";

interface AppStageProps extends StageProps {
  username: string;
}

class AppStage extends Stage {
  constructor(scope: Construct, id: string, props: AppStageProps) {
    super(scope, id, props);
    new HelloStack(this, `${props.username}-hello`);
  }
}

export class CdkPipelineStack extends Stack {
  name: string;
  username: string;
  pipeline: pipelines.CodePipeline;
  source: pipelines.CodePipelineSource;
  stagStage: pipelines.StageDeployment;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    this.name = id;
    this.username = this.node.tryGetContext("username");

    this.initRepository();
    this.initPipeline();

    this.addStagingStage();
  }

  private initRepository() {
    const repository = new codecommit.Repository(this, "CdkPipeline", {
      repositoryName: Stack.of(this).stackName,
    });
    this.source = pipelines.CodePipelineSource.codeCommit(repository, "master");
    new CfnOutput(this, "RepositoryCloneUrlGrc", {
      value: `git remote add pipeline ${repository.repositoryCloneUrlGrc}`,
    });
  }

  private initPipeline() {
    this.pipeline = new pipelines.CodePipeline(this, "CodePipeline", {
      pipelineName: Stack.of(this).stackName,
      synth: new pipelines.ShellStep("Synth", {
        input: this.source,
        commands: [
          "npm ci",
          "npm run build",
          `npx cdk synth --context username=${this.username} ${this.name}`,
        ],
      }),
    });
  }

  private addStagingStage() {
    this.stagStage = this.pipeline.addStage(
      new AppStage(this, "Staging", {
        username: this.username,
      })
    );
  }
}
