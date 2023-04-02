import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as Hello from "../lib/HelloStack";

test("Lambda and API Gateway Created", () => {
  const app = new cdk.App();
  const stack = new Hello.HelloStack(app, "MyTestStack");
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::Lambda::Function", {
    Runtime: "nodejs18.x",
  });
  template.resourceCountIs("AWS::ApiGateway::RestApi", 1);
});
