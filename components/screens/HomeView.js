'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Switch
} from 'react-native';

import EventEmitter from 'EventEmitter';
import { EventRegister } from 'react-native-event-listeners'
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MapView from 'react-native-maps';
import ActionButton from 'react-native-action-button';
import Button from 'apsl-react-native-button'
import Spinner from 'react-native-spinkit';
import BGService from '../lib/BGService';
import IDService from '../lib/IDService';
import PatrolService from '../lib/PatrolService';
import AuthService from '../lib/AuthService';
import Config from '../config';
import commonStyles from '../styles';
import BottomToolbarView from '../BottomToolbarView';
import IncidentView from './IncidentView'
import ChatView from './ChatView'
import QRView from './QRView';
import { StyleProvider } from "native-base";
import BackgroundFetch from "react-native-background-fetch";
var MAP_MARKER_IMAGE = require('../../images/location_marker.png');
// const LATITUDE_DELTA = 0.00099;
// const LONGITUDE_DELTA = 0.00099;
// const LATITUDE_DELTA = 0.0015;
// const LONGITUDE_DELTA = 0.0015;
const LATITUDE_DELTA = 0.0001;
const LONGITUDE_DELTA = 0.001;
const STATIONARY_REGION_FILL_COLOR = "rgba(200,0,0,0.2)"
const STATIONARY_REGION_STROKE_COLOR = "rgba(200,0,0,0.2)"
const POLYLINE_STROKE_COLOR = "rgba(32,64,255,0.6)";
let eventEmitter = new EventEmitter();
const timer = require('react-native-timer');



class HomeView extends React.Component {

  static navigatorStyle = {
    navBarBackgroundColor: Config.colors.blue
  };

  constructor(props) {
    super(props);

    this.bgService = BGService.getInstance();
    this.idService = IDService.getInstance();
    this.patrolService = PatrolService.getInstance();
    this.authService = AuthService.getInstance();

    this.lastMotionChangeLocation = undefined;

    this.state = {
      containerBorderWidth: 0,
      containerBorderColor: '#ff0000',
      isMainMenuOpen: false,
      title: '',
      centerCoordinate: {
        latitude: 0,
        longitude: 0
      },
      // ActionButton state
      isSyncing: false,
      // Map state
      isPressingOnMap: false,
      mapScrollEnabled: false,
      followsUserLocation: true,
      stationaryLocation: { timestamp: '', latitude: 0, longitude: 0 },
      stationaryRadius: 0,
      showsUserLocation: false,
      markers: [],
      routeMarkers: [],
      coordinates: [],
      checkpoints: [],
      bgGeo: {},
      idData: {}
    };

    this.onPressIncidentButton = this.onPressIncidentButton.bind(this);
    this.onPressChatButton = this.onPressChatButton.bind(this);
    this.onPressOptionsButton = this.onPressOptionsButton.bind(this);
    this.loadCurrentRoutes = this.loadCurrentRoutes.bind(this);
    this.startTracking = this.startTracking.bind(this);
    this.onPressQR = this.onPressQR.bind(this);

    this.props.navigator.toggleNavBar({
      to: 'hidden', // required, 'hidden' = hide navigation bar, 'shown' = show navigation bar
      animated: true // does the toggle have transition animation or does it happen immediately (optional). By default animated: true
    });
  }

  componentDidMount() {

    this.authService.set('enabled', false);

    BackgroundFetch.configure({
      stopOnTerminate: false,
      minimumFetchInterval: 0
    }, () => {
      this.bgService.getPlugin().logger.ok('FETCH RECEIVED');
      BackgroundFetch.finish();
    }, (error) => {
      console.warn('Fetch error: ', error);
    });

    this.bgService.getState((state) => {
      this.configureBackgroundGeolocation(state);

      this.idService.getState((state) => {
        this.setState({
          idData: state
        });
      });

      // POST GUARD HERE
      this.authService.guardPut(1);
      this.loadCurrentRoutes();

    });

    this.bgService.on('change', this.onBackgroundGeolocationChanged.bind(this));

    this.stopListener = EventRegister.addEventListener('patrol stop', (data) => {
      this.stopPatrol();
    })

    this.checkpointAddListener = EventRegister.addEventListener('checkpoint add', (data) => {

      this.setState({
        checkpoints: [...this.state.checkpoints, {
          routeMarkers: [...this.state.routeMarkers, this.createRouteMarker(data.latLng)],
          latitude: data.latLng.lat,
          longitude: data.latLng.lng
        }]
      });

    })

    this.newRouteListener = EventRegister.addEventListener('new route', (data) => {

      this.loadCurrentRoutes();

    })

  }

  componentWillUnmount() {
    timer.clearTimeout(this);
  }

  loadCurrentRoutes() {


    fetch(this.authService.getServerAddress() + '/currentroutes/' + this.idService.getCurrentGuardID())
      .then(res => res.json())
      .then(json => {

        //create a polyline for each of these
        this.loadCurrentCheckpoints(json[0].RouteID);
        this.idService.setCurrentRouteID(json[0].RouteID);
      }
      ).catch(err => {
      });
  }

  loadCurrentCheckpoints(routeID) {

    fetch(this.authService.getServerAddress() + '/checkpoints/' + routeID)
      .then(res => res.json())
      .then(json => {


        this.setState({
          checkpoints: [],
          routeMarkers: [],
        });

        for (var i = 0; i < json.length; i++) {

          let checkpoint = json[i];

          this.setState({
            checkpoints: [...this.state.checkpoints, {
              routeMarkers: [...this.state.routeMarkers, this.createRouteMarker(checkpoint)],
              latitude: checkpoint.lat,
              longitude: checkpoint.lng
            }]
          });


        }

      }
      ).catch(err => {
      });

  }

  componentWillUnmount() {

    //AppState.removeEventListener('change', this.onAppStateChange.bind(this));
    let bgGeo = this.bgService.getPlugin();

    // Unregister BackgroundGeolocation event-listeners!
    bgGeo.removeAllListeners();

    this.bgService.removeListeners();
  }

  onAppStateChange(currentAppState) {
    var showsUserLocation = (currentAppState === 'background') ? false : true;

    this.setState({
      currentAppState: currentAppState,
      showsUserLocation: showsUserLocation
    });
  }

  onBackgroundGeolocationChanged(name, value) {
    let bgGeo = this.state.bgGeo;
    bgGeo[name] = value;
    this.setState({ bgGeo: bgGeo });
  }

  onClickMapMenu(command) {
    this.bgService.playSound('BUTTON_CLICK');

  }

  onClickMainMenu() {
    let soundId = (this.state.isMainMenuOpen) ? 'CLOSE' : 'OPEN';
    this.setState({
      isMainMenuOpen: !this.state.isMainMenuOpen
    });
    this.bgService.playSound(soundId);
  }

  onSelectMainMenu(command) {
    let bgGeo = this.bgService.getPlugin();
    switch (command) {

      case 'resetOdometer':
        this.clearMarkers();
        this.bgService.playSound('BUTTON_CLICK');
        this.setState({ isResettingOdometer: true, odometer: '0.0' });
        this.bgService.setOdometer(0, () => {
          this.setState({ isResettingOdometer: false });
        }, (error) => {
          this.setState({ isResettingOdometer: false });
        });
        break;
      case 'emailLog':
        this.bgService.playSound('BUTTON_CLICK');

        break;
      case 'sync':
        this.bgService.playSound('BUTTON_CLICK');
        bgGeo.getCount((count) => {
          if (!count) {
            return;
          }

        });
        break;
      case 'destroyLocations':
        this.bgService.playSound('BUTTON_CLICK');
        bgGeo.getCount((count) => {
          if (!count) {
            return;
          }

        });
        break;
    }
  }

  onClickEnable() {



    let enabled = !this.authService.isEnabled();

    var bgGeo = this.bgService.getPlugin();


    if (enabled) {

      this.authService.toast('Patrol Starting')

      // this.authService.patrolPost();
      this.authService.connectToSocket();
      this.authService.startPushNotifications();
      this.patrolService.resetState();
      this.loadCurrentRoutes();


      bgGeo.start((state) => {
        this.setState({ isResettingOdometer: true, odometer: '0.0' });
        this.bgService.setOdometer(0, () => {
          this.setState({ isResettingOdometer: false });
        }, (error) => {
          this.setState({ isResettingOdometer: false });
        });
        this.setState({ showsUserLocation: true });

        bgGeo.changePace(true, (state) => {

        }, (error) => {
          console.info("Failed to changePace: ", error);
          this.setState({
            isChangingPace: false,
            isMoving: false // <-- reset state back
          });
        });

      });

    } else {
      this.stopPatrol();
    }

    this.authService.set('enabled', enabled);

    // Transmit to other components
    eventEmitter.emit('enabled', enabled);
  }

  stopPatrol() {

    let bgGeo = this.bgService.getPlugin();

    this.setState({ showsUserLocation: false });
    this.authService.resetState();

    bgGeo.stop(() => {
    });
    this.setState({
      coordinates: [],
      markers: [],
      stationaryRadius: 0,
      stationaryLocation: {
        timestamp: '',
        latitude: 0,
        longitude: 0
      }
    });
  }

  configureBackgroundGeolocation(config) {
    let bgGeo = this.bgService.getPlugin();
    let enabled = this.authService.isEnabled();


    ////
    // 1. Set up listeners on BackgroundGeolocation events
    //
    // location event
    this.onLocation = this.onLocation.bind(this);
    this.onHttp = this.onHttp.bind(this);
    this.onHeartbeat = this.onHeartbeat.bind(this);
    this.onError = this.onError.bind(this);
    this.onMotionChange = this.onMotionChange.bind(this);
    this.onSchedule = this.onSchedule.bind(this);
    this.onPowerSaveChange = this.onPowerSaveChange.bind(this);

    bgGeo.on("location", this.onLocation, this.onError);
    // http event
    bgGeo.on("http", this.onHttp);
    // heartbeat event
    bgGeo.on("heartbeat", this.onHeartbeat);
    // motionchange event
    bgGeo.on("motionchange", this.onMotionChange);
    // schedule event
    bgGeo.on("schedule", this.onSchedule);
    // powersavechange event
    bgGeo.on("powersavechange", this.onPowerSaveChange);
    ////
    // 2. Configure it.
    //
    // OPTIONAL:  Optionally generate a test schedule here.
    //  1: how many schedules?
    //  2: delay (minutes) from now to start generating schedules
    //  3: schedule duration (minutes); how long to stay ON.
    //  4: OFF time between (minutes) generated schedule events.
    //
    //  eg:
    //  schedule: [
    //    '1-6 9:00-17:00',
    //    '7 10:00-18:00'
    //  ]
    // UNCOMMENT TO AUTO-GENERATE A SERIES OF SCHEDULE EVENTS BASED UPON CURRENT TIME:
    //config.schedule = this.settingsService.generateSchedule(24, 1, 1, 1);
    //
    config.notificationLargeIcon = 'drawable/notification_large_icon';

    bgGeo.getSensors((sensors) => {
    });

    bgGeo.isPowerSaveMode((isPowerSaveMode) => {
      this.setState({ containerBorderWidth: (isPowerSaveMode) ? 5 : 0 });
    });

    bgGeo.configure(config, (state) => {

      // Broadcast to child components.
      eventEmitter.emit('enabled', enabled);

      // Tell react-native-maps to show blue current-location icons
      if (enabled) {
        this.setState({ showsUserLocation: true });
      }

      // Start the scheduler if configured with one.
      if (state.schedule.length) {
        bgGeo.startSchedule(function () {
          console.info('- Scheduler started');
        });
      }

      // Update UI
      this.setState({
        enabled: enabled,
        bgGeo: state
      });
    });
  }

  onError(error) {
    console.warn('- ERROR: ', JSON.stringify(error));
  }

  onMotionChange(event) {
    var location = event.location;
    if (event.isMoving) {
      if (this.lastMotionChangeLocation) {

      }
      this.setState({
        stationaryRadius: 0,
        stationaryLocation: {
          timestamp: '',
          latitude: 0,
          longitude: 0
        }
      });
    } else {

    }

    this.lastMotionChangeLocation = location;
  }

  onLocation(location) {

    // this.authService.toast('confidence: ' + location.activity.confidence);

    let coords = this.state.coordinates;
    let self = this;

    if (coords.length < 1) {
      timer.setTimeout(this, 'startTracking', () => {
        self.startTracking(location);
      }, 2000);

    } else {
      this.startTracking(location);
    }


  }

  startTracking(location) {
    if (!location.sample) {

      if (location.activity.confidence > 95) {
        if (this.locationIsAccurate(location)) {


          this.addMarker(location);
          this.authService.incrementCoordSequence();
          this.authService.coordPut(location);
          this.authService.setCurrentLocation(location);

          if (this.authService.isFirstLocation()) {
            this.authService.set('isFirstLocation', false);
            EventRegister.emit('first location', location);
          }

          EventRegister.emit('new location', location);

        }
      } else {

      }

    }

    // Seems to fix PolyLine rendering issue by wrapping call to setCenter in a timeout
    setTimeout(function () {
      this.setCenter(location);
    }.bind(this));


  }

  locationIsAccurate(location) {

    let coords = this.state.coordinates;

    if (coords.length > 0) {

      let lastLocation = coords[coords.length - 1];

      let maxDelta = 0.0004;

      let deltaLatitude = Math.abs(
        (location.coords.latitude - lastLocation.latitude)
      )

      let deltaLongitude = Math.abs(
        (location.coords.longitude - lastLocation.longitude)
      )

      if (
        (
          (deltaLatitude < maxDelta) &&
          (deltaLongitude < maxDelta))
      ) {
        return true;
      } else {
        console.log('location is not accurate');
        return false;
      }

    } else {
      return true;
    }

  }

  onPowerSaveChange(isPowerSaveMode) {
    // Show red side-border bars on map when in low-power mode.
    this.setState({
      containerBorderWidth: (isPowerSaveMode) ? 5 : 0
    });
  }

  onHeartbeat(params) {
  }

  onHttp(response) {
  }

  onSchedule(state) {
    this.authService.set('enabled', this.authService.isEnabled());
  }

  setCenter(location) {
    if (!this.refs.map) { return; }

    this.refs.map.animateToRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA
    });
  }

  onMapPanDrag() {
    this.setState({
      followsUserLocation: false,
      mapScrollEnabled: true
    });
  }

  clearMarkers() {
    this.setState({
      coordinates: [],
      markers: []
    });
  }

  addMarker(location) {
    this.setState({
      markers: [...this.state.markers, this.createMarker(location)],
      coordinates: [...this.state.coordinates, {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      }]
    });
  }

  addRouteMarker(location) {
    this.setState({
      key: location.CheckpointID,
      routeMarkers: [...this.state.routeMarkers, this.createRouteMarker(location)],
      checkpoints: [...this.state.checkpoints, {
        latitude: location.lat,
        longitude: location.lng
      }]
    });
  }

  createMarker(location) {
    return {
      key: location.uuid,
      title: location.timestamp,
      heading: location.coords.heading,
      coordinate: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      }
    };
  }

  createRouteMarker(location) {

    return {
      key: location.checkpointID,
      coordinate: {
        latitude: location.lat,
        longitude: location.lng
      }
    }
  }

  renderMarkers() {
    let rs = [];


    this.state.markers.map((marker) => {
      rs.push((
        <MapView.Marker
          key={marker.key}
          coordinate={marker.coordinate}
          anchor={{ x: 0, y: 0.1 }}
          title={marker.title}>
          <View style={[styles.markerIcon]}></View>
        </MapView.Marker>
      ));
    });
    return rs;
  }

  renderRouteMarkers() {
    let rs = [];

    this.state.routeMarkers.map((marker) => {
      rs.push((
        <MapView.Marker
          key={marker.key}
          coordinate={marker.coordinate}
          anchor={{ x: 0, y: 0.1 }}
          title={marker.title}>
          <View style={[styles.markerIcon]}></View>
        </MapView.Marker>
      ));
    });
    return rs;
  }

  renderSyncButton() {
    return (!this.state.isSyncing) ? (
      <Icon name="ios-cloud-upload" style={styles.actionButtonIcon} size={25} />
    ) : (
        <Spinner isVisible={true} size={20} type="Circle" color="#000000" style={styles.actionButtonSpinner} />
      );
  }

  incidentButton() {

    if (this.authService.isEnabled()) {
      let button = <Icon.Button onPress={this.onPressIncidentButton} name="md-paper" color="#000" backgroundColor={Config.colors.blue} underlayColor="transparent" size={22} style={[styles.incidentButton]} iconStyle={{ marginRight: 0 }} padding={10} marginRight={10} />

      return (
        <View >
          {button}
        </View>
      );
    }


  }

  onPressIncidentButton() {
    this.bgService.playSound('OPEN');
    this.props.navigator.showModal({
      screen: "convoyer.IncidentView", // unique ID registered with Navigation.registerScreen
      title: "CONVOYER", // title of the screen as appears in the nav bar (optional)
      passProps: {}, // simple serializable object that will pass as props to the modal (optional)
      animationType: 'slide-up' // 'none' / 'slide-up' , appear animation for the modal (optional, default 'slide-up')
    });
  }


  onPressQR() {
    this.bgService.playSound('OPEN');
    this.props.navigator.showModal({
      screen: "convoyer.QRView", // unique ID registered with Navigation.registerScreen
      title: "CONVOYER", // title of the screen as appears in the nav bar (optional)
      passProps: {}, // simple serializable object that will pass as props to the modal (optional)
      animationType: 'slide-up' // 'none' / 'slide-up' , appear animation for the modal (optional, default 'slide-up')
    });
  }

  qrButton() {

    if (this.authService.isEnabled()) {
      let button = <FontAwesome.Button onPress={this.onPressQR} name={Config.icons.qr} color="#000" backgroundColor={Config.colors.blue} underlayColor="transparent" size={22} style={[styles.incidentButton]} iconStyle={{ marginRight: 0 }} padding={10} marginRight={10} />

      return (
        <View >
          {button}
        </View>
      );
    }
  }

  chatButton() {

    if (this.authService.isEnabled()) {
      let button = <Icon.Button onPress={this.onPressChatButton} name="ios-chatbubbles" color="#000" backgroundColor={Config.colors.blue} underlayColor="transparent" size={22} style={[styles.incidentButton]} iconStyle={{ marginRight: 0 }} padding={10} marginRight={10} />

      return (
        <View >
          {button}
        </View>
      );
    }


  }

  onPressChatButton() {
    this.bgService.playSound('OPEN');
    this.props.navigator.showModal({
      screen: "convoyer.ChatView", // unique ID registered with Navigation.registerScreen
      title: "CONVOYER", // title of the screen as appears in the nav bar (optional)
      passProps: {}, // simple serializable object that will pass as props to the modal (optional)
      animationType: 'slide-up' // 'none' / 'slide-up' , appear animation for the modal (optional, default 'slide-up')
    });
  }

  optionsButton() {
    let button = <Icon.Button onPress={this.onPressOptionsButton} name="md-settings" color="#000" backgroundColor={Config.colors.blue} underlayColor="transparent" size={22} style={[styles.incidentButton]} iconStyle={{ marginRight: 0 }} padding={10} marginRight={10} />

    return (
      <View >
        {button}
      </View>
    );
  }

  onPressOptionsButton() {
    this.bgService.playSound('OPEN');
    this.props.navigator.showModal({
      screen: "convoyer.OptionsView", // unique ID registered with Navigation.registerScreen
      title: "CONVOYER", // title of the screen as appears in the nav bar (optional)
      passProps: {}, // simple serializable object that will pass as props to the modal (optional)
      animationType: 'slide-up' // 'none' / 'slide-up' , appear animation for the modal (optional, default 'slide-up')
    });
  }

  render() {
    return (

      <View style={styles.container}>

        <View style={styles.topToolbar}>
          {this.incidentButton()}
          {this.chatButton()}
          {this.qrButton()}
          {this.optionsButton()}

          <Text style={commonStyles.toolbarTitle}>{this.state.title}</Text>
          <Switch style={styles.switchContainer} onValueChange={() => this.onClickEnable()} value={this.authService.isEnabled()} />
        </View>

        <MapView
          ref="map"
          style={styles.map}
          showsUserLocation={this.state.showsUserLocation}
          onPanDrag={this.onMapPanDrag.bind(this)}
          scrollEnabled={this.state.mapScrollEnabled}
          showsMyLocationButton={false}
          showsPointsOfInterest={false}
          showsScale={false}
          showsTraffic={false}
          toolbarEnabled={false}
          loadingEnabled={true}
          maxZoomLevel={18}
          mapType='standard'
        >
          <MapView.Circle
            key={this.state.stationaryLocation.timestamp}
            radius={this.state.stationaryRadius}
            fillColor={STATIONARY_REGION_FILL_COLOR}
            strokeColor={STATIONARY_REGION_STROKE_COLOR}
            strokeWidth={1}
            center={{ latitude: this.state.stationaryLocation.latitude, longitude: this.state.stationaryLocation.longitude }}
          />
          <MapView.Polyline
            key="polyline"
            coordinates={this.state.coordinates}
            geodesic={true}
            strokeColor={Config.colors.polyline_color}
            strokeWidth={3}
            zIndex={0}
          />
          <MapView.Polyline
            key="route"
            coordinates={(this.state.checkpoints)}
            geodesic={true}
            strokeColor={Config.colors.red}
            strokeWidth={5}
            zIndex={0}
          />
          {this.renderMarkers()}
          {this.renderRouteMarkers()}
        </MapView>


        <BottomToolbarView eventEmitter={eventEmitter} enabled={this.authService.isEnabled()} />

      </View>

    );
  }
};

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingTop: 30,
    justifyContent: 'space-between',
    backgroundColor: Config.colors.blue

  },
  topToolbar: {
    backgroundColor: Config.colors.blue,
    borderBottomColor: 'black',
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 0.1
  },

  map: {
    flex: 1,
  },

  // Floating Action Button
  actionButtonIcon: {
    color: '#000'
  },
  actionButtonSpinner: {
    marginLeft: -2,
    marginTop: -2
  },
  // Map overlay styles
  marker: {
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: Config.colors.polyline_color,
    borderRadius: 0,
    zIndex: 0,
    width: 32,
    height: 32
  },
  geofenceHitMarker: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 6,
    zIndex: 10,
    width: 12,
    height: 12
  },
  markerIcon: {
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: Config.colors.red,
    width: 4,
    height: 4,
    borderRadius: 5
  },
  incidentButton: {
    backgroundColor: Config.colors.off_white
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignSelf: "stretch",
    alignItems: "center",
  },
  switchContainer: {

  },
  patrolStartButtonContainer: {
    flexDirection: "row",
    alignSelf: "flex-end",
  }
});

module.exports = HomeView;
