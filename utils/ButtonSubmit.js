import React, { Component } from 'react';
import Dimensions from 'Dimensions';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  Easing,
  Image,
  DeviceEventEmitter,
  AsyncStorage
} from 'react-native';
import Snackbar from 'react-native-snackbar';
import Icon from 'react-native-vector-icons/MaterialIcons'
import Login from "./funcLogin";
import spinner from '../images/Ripple-1.3s-30px.gif';

const DEVICE_WIDTH = Dimensions.get('window').width;
const MARGIN = 40;

export default class ButtonSubmit extends Component {
  constructor() {
    super();

    this.state = {
      isLoading: false,
    };
    this.buttonAnimated = new Animated.Value(0);
    this.growAnimated = new Animated.Value(0);
    this._onPress = this._onPress.bind(this);
  }

  _onPress() {

    if (this.state.isLoading) return;

    this.setState({ isLoading: true });
    Animated.timing(this.buttonAnimated, {
      toValue: 1,
      duration: 200,
      easing: Easing.linear,
    }).start();

    Login(
      this.props.data,

      // Success
      (__VIEWSTATE, $) => {
        AsyncStorage.setItem(
          '@NTUSTapp:StuAccountData',
          JSON.stringify(this.props.data)
        );
        let stuData = {
          "StuName": $('#studentname').text(),
          "StuInfo": $('#studentno').text() + "・" + $('#educode').text()
        };
        AsyncStorage.setItem(
          '@NTUSTapp:StuData',
          JSON.stringify(stuData)
        );
        this._onGrow();
        setTimeout(() => {
          this.setState({ isLoading: false });
          this.buttonAnimated.setValue(0);
          this.growAnimated.setValue(0);
          DeviceEventEmitter.emit('loginSuccess', {});
          this.props.navigation.navigate('Main', {
            success: true,
            StuData: stuData
          })
        }, 300);
      },

      // Failed
      (errMsg) => {
        this.setState({ isLoading: false });
        this.growAnimated.setValue(0);
        this.buttonAnimated.setValue(0);
        Snackbar.show({
          title: errMsg,
          duration: Snackbar.LENGTH_INDEFINITE,
          action: {
            title: '好QQ', color: 'green',
          },
        })
      }
    )

  }

  _onGrow() {
    Animated.timing(this.growAnimated, {
      toValue: 1,
      duration: 200,
      easing: Easing.linear,
    }).start();
  }

  render() {
    const changeWidth = this.buttonAnimated.interpolate({
      inputRange: [0, 1],
      outputRange: [DEVICE_WIDTH - 250, 40],
    });
    const changeScale = this.growAnimated.interpolate({
      inputRange: [0, 1],
      outputRange: [1, MARGIN],
    });

    return (
      <Animated.View style={{ width: changeWidth }}>
        <TouchableOpacity
          style={styles.button}
          onPress={this._onPress}
          activeOpacity={1}>
          {this.state.isLoading ? (
            <Image source={spinner} style={styles.image} />
          ) : (
              <Text style={styles.text}>LOGIN</Text>
            )}
        </TouchableOpacity>
        <Animated.View
          style={[styles.circle, { transform: [{ scale: changeScale }] }]}
        />
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A035E0',
    height: MARGIN,
    borderRadius: 20,
    zIndex: 100,
  },
  circle: {
    height: MARGIN,
    width: MARGIN,
    marginTop: -MARGIN,
    borderWidth: 1,
    borderColor: '#A035E0',
    borderRadius: 100,
    alignSelf: 'center',
    zIndex: 99,
    backgroundColor: '#A035E0',
  },
  text: {
    color: 'white',
    backgroundColor: 'transparent',
  },
  image: {
    width: 24,
    height: 24,
  },
});
