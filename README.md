# CONVOYER

##Table of Contents

### 1.0 Tech Stack
##### 1.1 Convoyer Mobile App
##### 1.2 Command Center App
##### 1.3 Back-End
### 2.0 Convoyer - Build Contents
##### 2.1 Overview
##### 2.2 Root Directory
##### 2.3 android Directory
##### 2.4 components Directory
##### 2.5 iOS Directory
### 3.0 Command Center - Build Contents
##### 3.1 Overview
### 4.0 Spring Boot Server - Build Contents
#### 4.1 Overview
### 5.0 Command Center - Application Logic
##### 5.1 app.js
##### 5.2 index.js
##### 5.3 ConvoyerView
### 6.0 Convoyer App - Application Logic
##### 6.1 index.js and app.js
##### 6.2 Views
### 7.0 Spring Boot Server - Application Logic
#### 7.1 Overview
### 8.0 Installation
#### 8.1 Maven
### 9.0 Error Fixes


## 1.0 Tech Stack
### 1.1 Convoyer Mobile App

- **React Native** *Hybrid mobile application framework that uses a Javascript framework called React.*

- **Objective C** ( iOS - rare usage) *Some plugins require native code to be modified.*

- **Java (Android - rare usage)** *Some plugins require native code to be modified.*

- **Android Studio** *Required for Android development.*

- **Xcode** *Required for iOS development.*


### 1.2 Command Center App

- **Javascript**

- **Pug / Jade** *Templating engine that uses Express.js to build web views. Originally called Jade, now renamed to Pug.*


### 1.3 Back-End
- **Node.js**

- **Express.js**

- **MySQL**

- **AWS / minio** *Used for storing incident media.*

- **Spring Boot Server** *Used with AWS / minio to return a presigned url and hide secure credentials for incident media uploads.*

- **Socket.io** *Used for various features that require real time data transport, such as location tracking and messaging.*

## 2.0 Convoyer - Build Contents
### 2.1 Overview

*The following directories are found in the mobile app’s source directory. Files and directories that are not used during development are not listed.*

- **root directory** *Several crucial files and setting files are located in the project's root directory.*

- **android** *Contains the build files necessary for running on Android. Directory will be used moderately during Android development.*

- **components** *All React Native code is here.*

- **images** *Contains several images used in the app.*

- **ios** *Contains the build files necessary for running on iOS. Directory will be used moderately during iOS development.*

- **node_modules** *directory generated when running npm install with a package.json in source directory. You will need to edit some modules during development.*

### 2.2 Root Directory

*The following files are found in the mobile app’s root directory. Files and directories that are not used during development are not listed.*

- **App.js** *Required by every React Native application. Contains code that registers all of the app’s components. This is the second file in our application lifecycle.*

- **app.json** *We can rename our application here.*

- **index.js** *Required by every React Native application. This is the first file in our application lifecycle.*

- **components** *All React Native code is here.*

- **package.json** *Created after running npm init. Always keep note of version numbers here because most issues you will encounter involve plugin incompatiblities.*

- **ReactotronConfig.js** *Necessary to use the [Reactotron](https://github.com/infinitered/reactotron)  plugin.*

### 2.3 Android Directory

*The following files and directories are found in the 
'android' directory. Files and directories that are not used during development are not listed.*

-  **app** *Several crucial files are located in this directory. These files will frequently be edited during android development.*

	- **src** *Inside this directory there are three files that will be required to edit when installing various plugins*
		- **MainActivity.java**
		- **MainApplication.java**
		- **AndroidManifest.xml**

	- **build.gradle** 
		- *An android project contains two build.gradle files. One is in the app directory, and another is in the root android directory.*  
		- *This build.gradle will be used frequently when installing plugins. Version numbers are crucial, and will break the app if there are any incompatibilities.*

- **build.gradle** *Root android directory build.gradle. Will need to be edited during installation of some plugins.*

- **settings.gradle** *Will need to be edited during installation of some plugins.*

### 2.4 Components Directory

*The following files and directories are found in the 
'components' directory. This directory is comprised of all of our React Native javascript files. All contents will be used during development.*

- **common** *These components are shared throughout our views.*

- **lib** *Most of our app logic is located here. These are async services, much like providers in Angular, that handle data storage, data transactions and API calls.*
	- **AuthService.js** *Handles the following features:*
		- push notifications
		- toast messages
		- socket.io chat
		- API calls

	- **BackgroundGeolocationHeadlessService** *Needed for background geolocation plugin.*

	- **BGService.js** *Handles background geolocation features.*

	- **IDService.js** *Creates and provides unique IDs.*

	- **PatrolService.js** *Contains various helper methods for CONVOYER.*

- **screens**	*All the screens we see in our app are here. Some files here handle data transactions and API calls.*

- **BottomToolbarView.js**	 *The bottom toolbar view.*

- **config.js** *Contains various constants used througout our application.*

- **styles.js** *Contains various styles used througout our application.*

### 2.5 iOS Directory

*The following files and directories are found in the 
'ios' directory. Files and directories that are not used during development are not listed.*

- **foxwatch** *This directory contains the Xcode project for our application.*

	- **AppDelegate.m** *Several plugins will require modifying this file.* 

	- **Info.plist** *Several plugins will require modifying this file. It is highly recommended to edit the file through Xcode rather than here. This way you can avoid syntactical errors.*

	- **Podfile** *Several plugins will require the use of the dependency manager, [CocoaPods] (https://cocoapods.org).* This podfile is created when running pod install from the ios folder root directory.

## 3.0 Command Center - Build Contents
### 3.1 Overview

*The following files and directories are found in the command center app’s source directory. Files and directories that are not used during development of CONVOYER are not listed.*

- **certificates** *Contains the .p8 certificate file used by [Apple Push Notification Service] (https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/APNSOverview.html).*

- **controllers/Convoyer** *Contains our Express.js controllers.*

- **models/Convoyer** *Contains our Express.js models.*

- **public** *All of our client side scripts, html views, assets, and styles are located here..*

- **routes** *Contains the crucial file index.js, that sets up all of our Express.js routes.*

- **views** *Contains our Express.js views. Do not rename the folder. Also, note that subdirectories won't be seen by Express.*

- **.env** *Holds our MySQL database credentials.*

- **app.js** *The start point to our Express.js application. Our Socket.io server and push notification logic is here. *

## 4.0 Spring Boot Server - Build Contents
### 4.1 Overview

*The following files and directories are found in the spring boot server's source directory. Files and directories that are not used during development of CONVOYER are not listed.*

- **src/main/java/ch/rasc/upload/PreSignController.java** *Spring boot looks here for our bucket name*.

- **resources/application.yml** *Hold our AWS or Minio credentials.*

## 5.0 Command Center - Application Logic

### 5.1 app.js

1. When we run **node app** in a terminal, this is where our Express.js application's life begins. Here we tell express to route all addresses that begin with **/** to go to our **index.js** file to see our list of routes. Say someone types **commandcenter.com/apples** in their address bar. Express will look for the apples route in index.js to recieve instructions on what to do next, whether it's rendering a page or querying our database.
- **initalizeSockets()** *starts our Socket.io server, which is used for our messaging and any other features that require real-time updates, such as location tracking and incident alerts.*
- **getDevices()** Makes a GET request on the **/guardnotifications** route defined in our **index.js** file.
- **index.js** tells the application to access one of our controllers in the **controllers/Convoyer** directory, **ConvoyerController.js**.
- From **ConvoyerController.js** the **getGuardsForNotifications** method is called. This method calls the **ConvoyerModel.js** model file found in **models/Convoyer**.
- **ConvoyerModel** queries the database and returns the results as JSON. The data returned is the list of devices to send push notifications to.
- After the data is returned, **setSocketListeners()** is called to set listeners for our socket server.
- When 'patrol start' is heard on our socket server, **patrolPost()** is called to post the patrol data to the database.
- When 'ended patrol' is heard on our socket server, **patrolPut()** is called to update the patrol as not active anymore.

### 5.2 index.js

1. Whenever a Command Center user opens Convoyer's Live View, our application looks inside **index.js** for the GET route, **/convoyerliveview**.
2. The application sees that the **getConvoyer** method of **ConvoyerController** should be called.
3. **getConvoyer** calls several methods in **ConvoyerModel**. 
4. After the last method, **ConvoyerModel.getCurrentCheckpoints** is finished running, **ConvoyerView** is rendered.

### 5.3 ConvoyerView

1. **ConvoyerView** contains an object with an address to the **/convoyerlivemap** route. Again, the application looks inside **index.js** for instructions on what to do next.
2. **ConvoyerMapController** calls several methods in **ConvoyerMapModel** and then renders the **ConvoyerMapView**.
3. **ConvoyerMapView** imports and calls a script, **convoyerMapScript**. **convoyerMapScript** handles all of the client side javascript. It is located in the **public/convoyer/live-view** directory.

The **Route Editor**, **Patrol Replay** and **Incident Details** follow the same logic.

## 6.0 Convoyer App - Application Logic

### 6.1 index.js and app.js

1. The first place our react native application looks is **index.js**. Here we tell the application to look at **App.js** to begin rendering our app.
2. **App.js** imports all of the views we will need and registers them with the [react-native-navigation] (https://github.com/wix/react-native-navigation) plugin.
3. The first screen rendered by our app is the **LoginView**.

### 6.2 Views
1. Every react native view must contain a **render()** method.
2. **render()** renders the log in view to the user. Inside **LoginView.js** there are various helper methods that make the view functional.
3. When the user authenticates **HomeView.js** is rendered using its **render()** method. The other views are rendered in the same way.
4. Views call the services in the **components/lib** directory often for all kinds of business logic.

## 7.0 Spring Boot Server - Application Logic

### 7.1 Overview

1. Our Spring Boot Server is started by running **mvn spring-boot:run** from the server's root directory. 
2. While using the Convoyer Mobile App, the user submits incidents through the **IncidentView**. When an incident contains media, the **fetchPresignUrl()** method is called.
2. fetchPresignUrl calls the API endpoint **:8080/getPreSignUrl**
3. Spring Boot Server returns a **presigned url** to the client so we don't have to give out our AWS/minio credentials. 
4. **IncidentView** uses the **presigned URL** to upload media to our AWS or Minio bucket.

## 8.0 Installation

### 8.0 Required Software

1. MySql 5.7
2. Apache Maven
3. Node.js
4. JDK
5. React
6. React Native

### 8.1 Recommended Tools

1. Visual Studio Code (IDE)
2. HeidiSQL (MySQL GUI)

### 8.2 Maven Installation

*You will use Maven to run our Spring Boot Server, that assigns pre signed URL's to a specific route that allows us to upload media to our AWS / minio bucket*

1. Download **JDK** (Java Development Kit)
2. Download **Apache Maven**
3. Store contents of downloads in **Program Files**
4. Click start on Windows and type '**environment variables**'
5. Select '**Edit the system environment variables**'
6. Click the '**Environment Variables**' button on the bottom
7. On the '**System Variables**' section, click 'New'
8. For 'Variable name', type **JAVA_HOME**
9. For 'Variable Value', type the location of your **jdk folder** (typically this will be C:\Program Files\Java\jdk1.8.0_171
10. Add two more environment variables, **M2_HOME** and **MAVEN_HOME**, both with the same value, the location of your maven folder, typically **C:\Program Files\apache-maven-3.5.3**
11. Find the variable with the name '**Path**'
12. Click '**Edit**'
13. Click '**New**'
14. Type **C:\Program Files\Java\jdk1.8.0_171\bin** (or wherever your JDK bin folder is
15. Add another, this time with the value **%M2_HOME%\bin**
16. Click **OK** on all screens
17. Open **cmd** on Windows
18. type **mvn -v** to verify installation was successful
19. To run our Spring Boot server, go to the folder where you installed the spring boot project in cmd type **mvn spring-boot:run**

### 8.3 MySQL Installation
1. Download and install MySQL server 5.7
2. On the **System Variables** section in Environment variables, locate '**Path**' and click '**Edit**'
3. Add the location of your mysql bin directory
4. Locate the mobss.sql file supplied to you
5. Browse to that directory in a git bash terminal
6. **mysql -uroot -ppassword mobss < ./mobss.sql**

## 9.0 Error Fixes
Due to the nature of our development environment, you might encounter a number of errors caused by faulty code in various plugins we will be using. I will outline the most common errors you will face, as well as how to approach new errors.

### 9.1 React Native

#### 9.1.1 'No bundle Url present'

When you run your react native project via **react-native-run-ios**, you may see a red screen pop up with this message. 

To fix, enter the following in a terminal (in your project's root directory)

**rm -rf ios/build/; kill $(lsof -t -i:8081); react-native run-ios**

Or enter

**echo "alias rni=\"kill \$(lsof -t -i:8081); rm -rf ios/build/; react-native run-ios\"" >> ~/.bashrc; source ~/.bashrc**

To add this command to your bash profile. After doing this you can type **rni** in your terminal as a shortcut.

#### 9.1.2 
