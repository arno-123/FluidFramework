/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from "path";
import * as winston from "winston";
import { configureLogging } from "@fluidframework/server-services-utils";
import { RiddlerResourcesFactory, RiddlerRunnerFactory } from "@fluidframework/server-routerlicious-base";
import { runService } from "../runner";

const configPath = path.join(__dirname, "../../config/config.json");

configureLogging(configPath);

runService(
    new RiddlerResourcesFactory(),
    new RiddlerRunnerFactory(),
    winston,
    "riddler",
    configPath);
