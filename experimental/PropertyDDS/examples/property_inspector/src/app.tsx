/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react';
import ReactDOM from 'react-dom';

import { getDefaultObjectFromContainer } from "@fluidframework/aqueduct";
import { getFRSContainer, hasFRSEndpoints } from "./utils/getFRSContainer";

import { PropertyTreeContainerRuntimeFactory as ContainerFactory } from "./containerCode";
import { IPropertyTree } from "./dataObject";
import { getTinyliciousContainer } from "@fluid-experimental/get-container";

import { PropertyProxy } from '@fluid-experimental/property-proxy';
import _ from 'lodash';


import { FluidBinder } from '@fluid-experimental/property-binder';
import { PropertyFactory } from '@fluid-experimental/property-properties';
import { registerSchemas } from '@fluid-experimental/schemas';

import { InspectorApp } from './inspector';

// In interacting with the service, we need to be explicit about whether we're creating a new document vs. loading
// an existing one.  We also need to provide the unique ID for the document we are creating or loading from.

// In this app, we'll choose to create a new document when navigating directly to http://localhost:8080.  For the ID,
// we'll choose to use the current timestamp.  We'll also choose to interpret the URL hash as an existing document's
// ID to load from, so the URL for a document load will look something like http://localhost:8080/#1596520748752.
// These policy choices are arbitrary for demo purposes, and can be changed however you'd like.
let createNew = false;
if (location.hash.length === 0) {
    createNew = true;
    location.hash = Date.now().toString();
}
const documentId = location.hash.substring(1);
document.title = documentId;

async function start(): Promise<void> {

    // Register all schemas.
    // It's important to register schemas before loading an existing document
    // in order to process the changeset.
    registerSchemas(PropertyFactory);

    // The getTinyliciousContainer helper function facilitates loading our container code into a Container and
    // connecting to a locally-running test service called Tinylicious.  This will look different when moving to a
    // production service, but ultimately we'll still be getting a reference to a Container object.  The helper
    // function takes the ID of the document we're creating or loading, the container code to load into it, and a
    // flag to specify whether we're creating a new document or loading an existing one.
    const container = hasFRSEndpoints() ?
        await getFRSContainer(documentId, ContainerFactory, createNew)
        : await getTinyliciousContainer(documentId, ContainerFactory, createNew);

    const options = {
        paths: undefined,
        clientFiltering: false
    };

    const propertyTree: IPropertyTree = await getDefaultObjectFromContainer<IPropertyTree>(container, {options});

    // Creating a FluidBinder instance.
    const fluidBinder = new FluidBinder();

    fluidBinder.attachTo(propertyTree);

    // Listening to any change the root path of the PropertyDDS, and rendering the latest state of the
    // inspector tree-table.
    fluidBinder.registerOnPath('/', ['insert', 'remove', 'modify'], _.debounce(() => {
        // Create an ES6 proxy for the DDS, this enables JS object interface for interacting with the DDS.
        // Note: This is what currently inspector table expect for "data" prop.
        const proxifiedDDS = PropertyProxy.proxify(propertyTree.pset);
        ReactDOM.render(<InspectorApp data={proxifiedDDS}/>, document.getElementById('root'))
    }, 20));

    // Reload the page on any further hash changes, e.g. in case you want to paste in a different document ID.
    window.addEventListener("hashchange", () => {
        location.reload();
    });
}

start().catch((error) => console.error(error));
