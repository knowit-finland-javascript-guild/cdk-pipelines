import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as path from "path";

export class HelloStack extends Stack {
  private lambda: lambda.Function;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.initLambda();
    this.initApiGw();
  }

  private initLambda() {
    this.lambda = new lambda.Function(this, "HelloLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/Hello")),
    });
  }

  private initApiGw() {
    // defines an API Gateway REST API resource backed by our "hello" function.
    new apigw.LambdaRestApi(this, "HelloApi", {
      handler: this.lambda,
    });
  }
}
