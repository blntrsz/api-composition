import * as cdk from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { FunctionUrlAuthType, Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

export class ApiCompositionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const articlesAPI = new API(this, "articles", {
      entry: "functions/articles-api.ts",
    });
    new cdk.CfnOutput(this, "Articles API", {
      value: articlesAPI.api.url,
    });

    const authorsAPI = new API(this, "authors", {
      entry: "functions/authors-api.ts",
    });
    new cdk.CfnOutput(this, "Authors API", {
      value: authorsAPI.api.url,
    });

    const commentsAPI = new API(this, "comments", {
      entry: "functions/comments-api.ts",
    });
    new cdk.CfnOutput(this, "Comments API", {
      value: commentsAPI.api.url,
    });

    // Create Step Function Tasks to call the APIs
    const articlesTask = new tasks.CallApiGatewayHttpApiEndpoint(
      this,
      "InvokeArticlesAPI",
      {
        apiId: articlesAPI.api.restApiId,
        apiStack: articlesAPI.api.stack,
        stageName: articlesAPI.api.deploymentStage.stageName,
        method: tasks.HttpMethod.GET,
      },
    );

    const authorsTask = new tasks.CallApiGatewayHttpApiEndpoint(
      this,
      "InvokeAuthorsAPI",
      {
        apiId: authorsAPI.api.restApiId,
        apiStack: authorsAPI.api.stack,
        stageName: authorsAPI.api.deploymentStage.stageName,
        method: tasks.HttpMethod.GET,
      },
    );

    const commentsTask = new tasks.CallApiGatewayHttpApiEndpoint(
      this,
      "InvokeCommentsAPI",
      {
        apiId: commentsAPI.api.restApiId,
        apiStack: commentsAPI.api.stack,
        stageName: commentsAPI.api.deploymentStage.stageName,
        method: tasks.HttpMethod.GET,
      },
    );

    // Define the Express Workflow
    const parallel = new sfn.Parallel(this, "ParallelState");
    parallel.branch(articlesTask);
    parallel.branch(authorsTask);
    parallel.branch(commentsTask);

    const definition = parallel.next(
      new sfn.Pass(this, "AggregateResults", {
        parameters: {
          articles: sfn.JsonPath.stringAt("$.[0].ResponseBody"),
          authors: sfn.JsonPath.stringAt("$.[1].ResponseBody"),
          comments: sfn.JsonPath.stringAt("$.[2].ResponseBody"),
        },
      }),
    );

    const stateMachine = new sfn.StateMachine(this, "StateMachine", {
      definition,
      logs: {
        level: sfn.LogLevel.ALL,
        destination: new LogGroup(this, "sm-log-group"),
      },
      stateMachineType: sfn.StateMachineType.EXPRESS,
    });

    stateMachine.addToRolePolicy(
      new PolicyStatement({
        actions: ["*"],
        resources: ["*"],
      }),
    );

    // Create an API Gateway HTTP API to trigger the Step Function
    const api = new apigateway.RestApi(this, "HttpApi");

    api.root.addMethod(
      "GET",
      apigateway.StepFunctionsIntegration.startExecution(stateMachine),
    );

    new cdk.CfnOutput(this, "HTTP API Endpoint", {
      value: api.url!,
    });
  }
}

class API extends Construct {
  api: LambdaRestApi;
  constructor(
    scope: Construct,
    id: string,
    props: {
      entry: string;
    },
  ) {
    super(scope, id);

    const fn = new NodejsFunction(this, `${id}-lambda`, {
      entry: props.entry,
      handler: "handler",
      timeout: cdk.Duration.seconds(29),
      memorySize: 1024,
      runtime: Runtime.NODEJS_20_X,
      tracing: Tracing.ACTIVE,
    });
    fn.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });

    this.api = new LambdaRestApi(this, `${id}-api`, {
      handler: fn,
    });
  }
}
