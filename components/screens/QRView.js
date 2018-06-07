'use strict';

import React, { Component } from 'react';

import {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableOpacity,
  Linking,
  Alert
} from 'react-native';
import { EventRegister } from 'react-native-event-listeners'
import QRCodeScanner from 'react-native-qrcode-scanner';
import Config from '../config';

import AuthService from '../lib/AuthService';

class QRView extends React.Component {

  constructor(props) {
    super(props);


    this.authService = AuthService.getInstance();

    this.state = {

    }

    this.props.navigator.toggleNavBar({
      to: 'hidden', // required, 'hidden' = hide navigation bar, 'shown' = show navigation bar
      animated: true // does the toggle have transition animation or does it happen immediately (optional). By default animated: true
    });

    this.onPressOK = this.onPressOK.bind(this);

  }

  onSuccess(e) {

    /**
    
                              TODO:
                              Get location from AuthService
                              Post to coordinate table via AuthService
    
     
     * */

    this.props.navigator.dismissModal({
      animationType: 'slide-down' // 'none' / 'slide-down' , dismiss animation for the modal (optional, default 'slide-down')
    });

/**
 HERE IS THE FORMAT TO FOLLOW FOR QR CODE LOCATIONS
 
  {"coords":{"longitude":-118.2702035, "latitude":  34.1483695}, "description": "Ara's House"}

 
 */

    try{
    
      let location = JSON.parse(e.data);


    this.authService.incrementCoordSequence();
    this.authService.coordPut(location);
    this.authService.setCurrentLocation(location);

    if (this.authService.isFirstLocation()) {
      this.authService.set('isFirstLocation', false);
      EventRegister.emit('first location', location);
    }

    EventRegister.emit('new location', location);

    Alert.alert(
      'Location Manually Recorded at ' + location.description
    )

    } catch (e) {
      Alert.alert(
        'Invalid QR Code',
        'Please make sure you are scanning a QR sticker that was installed by Mobss.',
      )
    }
    



  }

  onPressOK() {
    this.props.navigator.dismissModal({
      animationType: 'slide-down' // 'none' / 'slide-down' , dismiss animation for the modal (optional, default 'slide-down')
    });
  }

  render() {
    return (
      <QRCodeScanner
        onRead={this.onSuccess.bind(this)}
        topContent={
          <Text style={styles.centerText}>
            Scan a <Text style={styles.textBold}>QR code</Text> to record your location manually.
          </Text>
        }
        bottomContent={
          <TouchableOpacity style={styles.buttonTouchable}
            onPress={this.onPressOK}
          >
            <Text style={styles.buttonText}>Close Camera</Text>
          </TouchableOpacity>
        }
      />
    );
  }
}

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
});

module.exports = QRView;