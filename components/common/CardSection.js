import React from 'react';
import { View } from 'react-native';
import Config from '../config';

const CardSection = (props) => {
  return (
    <View style={styles.containerStyle}>
      {props.children}
    </View>
  );
};

const styles = {
  containerStyle: {
    borderBottomWidth: 1,
    padding: 5,
    backgroundColor: Config.colors.off_white,
    justifyContent: 'flex-start',
    flexDirection: 'row',
    borderColor: Config.colors.black,
    position: 'relative'
  }
};

export { CardSection };
