# Power SDK Instructions Start
## Overview

This guide explains how to initialize an app, add a data source using the Power SDK CLI and generate the corresponding Models and Services, and publish the app.

**Always continue immediately** without asking for confirmation at each step.

## CLI Command

Use the following command to initialize an app:

```bash
pa app init --display-name <app name> --environment-id <environmentId>
```

**Example:**

```bash
pa app init --display-name "Asset Tracker" --environment-id "<environment-id>"
```

Use the following command to add a data source:

```bash
pa app add data-source --connector <apiId> --connection-id <connectionId>
```

**Example:**

```bash
pa app add data-source --connector "shared_office365users" --connection-id "<connection-id>"
```

If additional parameters such as table and dataset are required, use:

```bash
pa app add data-source --connector <apiId> --connection-id <connectionId> --table <tableName> --dataset <datasetName>
```

**Example:**

```bash
pa app add data-source --connector "shared_sql" --connection-id "<connection-id>" --table "[dbo].[MobileDeviceInventory]" --dataset "<server-name>,<database-name>"
```

Use the following command to publish an app:

```bash
npm run build
pa app push
```

**Example:**

```bash
pa app push
```

## Using Model and Service

- Read the files under src\Models and src\Services folder for data binding.
- Read the files under .power\schemas folder for other schema reference.
# Power SDK Instructions End