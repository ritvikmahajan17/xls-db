# **xlsDB User Guide**

`xlsDB` is a Node.js application built with the NestJS framework that allows users to interact with Google Sheets as if they were a database. It provides APIs to perform CRUD operations on Google Sheets.

---

## **Prerequisites**

1. **Google Cloud Setup**:

   - Create a Google Cloud project.
   - Enable the **Google Sheets API** for your project.
   - Create a **Service Account** and download the JSON credentials file.
     -For details on how to set up a Google Service Account, refer to the [Service Account Setup](#setting-up-a-google-service-account) section.

2. **Install Dependencies**:
   Run the following command in the project directory:

   ```bash
   npm install
   ```

3. **Run the Application**:
   Use the following command to start the server:

   ```bash
   npm run start
   ```

   The application will run on `http://localhost:5050`.

4. **Access Swagger API Documentation**:
   Open your browser and navigate to:
   ```
   http://localhost:5050/api
   ```
   This will display the Swagger UI, where you can test all the available APIs interactively.

## **Available APIs**

### **1. Add a Single Row**

- **Endpoint**: `POST /xlsDB/add`
- **Description**: Appends a single row to the Google Sheet.
- **Request Body**:
  ```json
  {
    "values": {
      "name": "John Doe",
      "age": "30",
      "city": "New York"
    },
    "sheetId": "<your-sheet-id>",
    "serviceClientEmail": "<your-service-client-email>",
    "servicePrivateKey": "<your-service-private-key>",
    "sheetName": "Sheet1"
  }
  ```
- **Response**:
  ```json
  {
    "spreadsheetId": "<your-spreadsheet-id>",
    "updatedRange": "<sheet-name>!A4:D4",
    "updatedRows": 1,
    "updatedColumns": 4,
    "updatedCells": 4
  }
  ```

---

### **2. Add Multiple Rows**

- **Endpoint**: `POST /xlsDB/batch-add`
- **Description**: Appends multiple rows to the Google Sheet.
- **Request Body**:
  ```json
  {
    "values": [
      {
        "name": "John Doe",
        "age": "30",
        "city": "New York"
      },
      {
        "name": "Jane Doe",
        "age": "25",
        "city": "Los Angeles"
      }
    ],
    "sheetId": "<your-sheet-id>",
    "serviceClientEmail": "<your-service-client-email>",
    "servicePrivateKey": "<your-service-private-key>",
    "sheetName": "Sheet1"
  }
  ```
- **Response**:
  ```json
  {
    "spreadsheetId": "<your-spreadsheet-id>",
    "updatedRange": "<sheet-name>!A4:D5",
    "updatedRows": 2,
    "updatedColumns": 4,
    "updatedCells": 8
  }
  ```

---

### **3. Get a Single Row**

- **Endpoint**: `POST /xlsDB/get-one`
- **Description**: Retrieves a single row matching the specified condition.
- **Request Body**:
  ```json
  {
    "where": {
      "name": "John Doe"
    },
    "sheetId": "<your-sheet-id>",
    "serviceClientEmail": "<your-service-client-email>",
    "servicePrivateKey": "<your-service-private-key>",
    "sheetName": "Sheet1"
  }
  ```
- **Response**:
  - **Success**:
    ```json
    {
      "matchingRowIndex": 3,
      "value": {
        "name": "John Doe",
        "age": "30",
        "city": "New York"
      },
      "success": true
    }
    ```
  - **Failure**:
    ```json
    {
      "matchingRowIndex": -1,
      "value": "No data found",
      "success": false
    }
    ```

---

### **4. Get All Matching Rows**

- **Endpoint**: `POST /xlsDB/get-all`
- **Description**: Retrieves all rows matching the specified condition.
- **Request Body**:
  ```json
  {
    "where": {
      "city": "New York"
    },
    "sheetId": "<your-sheet-id>",
    "serviceClientEmail": "<your-service-client-email>",
    "servicePrivateKey": "<your-service-private-key>",
    "sheetName": "Sheet1"
  }
  ```
- **Response**:
  - **Success**:
    ```json
    {
      "matchingRowIndex": [3, 5],
      "value": [
        {
          "name": "John Doe",
          "age": "30",
          "city": "New York"
        },
        {
          "name": "Jane Doe",
          "age": "25",
          "city": "New York"
        }
      ],
      "success": true
    }
    ```
  - **Failure**:
    ```json
    {
      "matchingRowIndex": [],
      "value": "No data found",
      "success": false
    }
    ```

---

### **5. Update Rows**

- **Endpoint**: `PUT /xlsDB/update`
- **Description**: Updates rows matching the specified condition.
- **Request Body**:
  ```json
  {
    "where": {
      "name": "John Doe"
    },
    "newValues": {
      "age": "31"
    },
    "sheetId": "<your-sheet-id>",
    "serviceClientEmail": "<your-service-client-email>",
    "servicePrivateKey": "<your-service-private-key>",
    "sheetName": "Sheet1"
  }
  ```
- **Response**:
  - **Success**:
    ```json
    {
      "message": "Data updated",
      "success": true
    }
    ```
  - **Failure**:
    ```json
    {
      "message": "No data found",
      "success": false
    }
    ```

---

### **6. Delete Rows**

- **Endpoint**: `DELETE /xlsDB/delete`
- **Description**: Deletes rows matching the specified condition.
- **Request Body**:
  ```json
  {
    "where": {
      "name": "John Doe"
    },
    "sheetId": "<your-sheet-id>",
    "serviceClientEmail": "<your-service-client-email>",
    "servicePrivateKey": "<your-service-private-key>",
    "sheetName": "Sheet1"
  }
  ```
- **Response**:
  - **Success**:
    ```json
    {
      "message": "Data deleted",
      "success": true
    }
    ```
  - **Failure**:
    ```json
    {
      "message": "No data found",
      "success": false
    }
    ```

---

## **Setting Up a Google Service Account**

To use `xlsDB`, you need to set up a Google Service Account to authenticate with the Google Sheets API. Follow these steps:

### **1. Create a Google Cloud Project**

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click on **Select a Project** in the top navigation bar.
3. Click **New Project** and provide a name for your project.
4. Click **Create**.

---

### **2. Enable the Google Sheets API**

1. In the Google Cloud Console, navigate to **APIs & Services > Library**.
2. Search for **Google Sheets API**.
3. Click on it and then click **Enable**.

---

### **3. Create a Service Account**

1. Go to **APIs & Services > Credentials** in the Google Cloud Console.
2. Click **Create Credentials** and select **Service Account**.
3. Fill in the required details (e.g., Service Account Name) and click **Create and Continue**.
4. Assign the role **Editor** (or a role with sufficient permissions) and click **Continue**.
5. Click **Done**.

---

### **4. Generate a Service Account Key**

1. In the **Credentials** page, find your newly created Service Account.
2. Click the **Edit** button (pencil icon) next to it.
3. Go to the **Keys** tab and click **Add Key > Create New Key**.
4. Select **JSON** as the key type and click **Create**.
5. A JSON file will be downloaded to your computer. This file contains your Service Account credentials.

---

### **5. Share Your Google Sheet with the Service Account**

1. Open the Google Sheet you want to use with `xlsDB`.
2. Click the **Share** button in the top-right corner.
3. Add the **client_email** from the Service Account JSON file as a collaborator (e.g., `your-service-account@your-project.iam.gserviceaccount.com`).
4. Set the permission to **Editor** and click **Send**.

---

### **6. Use the Service Account Credentials in `xlsDB`**

- Use the downloaded JSON file to provide the following details in your API requests:
  - `serviceClientEmail`: The `client_email` field from the JSON file.
  - `servicePrivateKey`: The `private_key` field from the JSON file.

Your Service Account is now set up and ready to use with `xlsDB`.
