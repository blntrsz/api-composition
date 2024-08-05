#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ApiCompositionStack } from "../lib/api-composition-stack";

const app = new cdk.App();
new ApiCompositionStack(app, "ApiCompositionStack");
