'use strict';

import './ReactotronConfig'

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  TouchableHighlight,
  StatusBar,
  Text
} from 'react-native';


import { Navigation } from 'react-native-navigation';

import Icon from 'react-native-vector-icons/Ionicons';
import BackgroundGeolocation from 'react-native-background-geolocation';

global.BackgroundGeolocation = BackgroundGeolocation;

import Config from './components/config';
import HomeView from './components/screens/HomeView';
import IncidentView from './components/screens/IncidentView';
import CameraView from './components/screens/CameraView';
import VideoView from './components/screens/VideoView';
import ChatView from './components/screens/ChatView';
import LoginView from './components/screens/LoginView';
import OptionsView from './components/screens/OptionsView';
import QRView from './components/screens/QRView';


var startPage = 'convoyer.LoginView';
console.disableYellowBox = true;


export default class Application extends Component {



  //with the navigation api, none of this stuff is being called it seems...

  //   componentDidMount() {

  //     StatusBar.setBarStyle('default');
  //     console.ignoredYellowBox = ['Remote debugger'];

  //   }
  //   render() {
  //     return (
  //       <View  >
  //         <LoginView />
  //       </View>
  //     );
  //   }
}



Navigation.registerComponent('convoyer.HomeView', () => HomeView);
Navigation.registerComponent('convoyer.CameraView', () => CameraView);
Navigation.registerComponent('convoyer.VideoView', () => VideoView);
Navigation.registerComponent('convoyer.IncidentView', () => IncidentView);
Navigation.registerComponent('convoyer.ChatView', () => ChatView);
Navigation.registerComponent('convoyer.LoginView', () => LoginView);
Navigation.registerComponent('convoyer.OptionsView', () => OptionsView);
Navigation.registerComponent('convoyer.QRView', () => QRView);


Navigation.startSingleScreenApp({
  screen: {
    screen: startPage,
    title: 'CONVOYER',
    navigatorStyle: {
      navBarTextColor: Config.colors.white
    }
  }
});





