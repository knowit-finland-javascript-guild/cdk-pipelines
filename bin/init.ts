#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CdkPipelineStack } from "../lib/CdkPipelineStack";
import { HelloStack } from "../lib/HelloStack";

const app = new cdk.App();
const username = app.node.tryGetContext("username");
if (!username) {
  throw new Error("Use --context username=myname");
}

new HelloStack(app, `${username}-app-hello`);
new CdkPipelineStack(app, `${username}-pipeline-hello`);
