
import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  PixelRatio,
  Dimensions,
  Platform,
  Slider
} from 'react-native';
import YouTube, { YouTubeStandaloneIOS, YouTubeStandaloneAndroid } from 'react-native-youtube';

// API CREDENTIALS
const YOUTUBE_API_KEY = '';
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const VIDEO_CONTAINER_HEIGHT = DEVICE_HEIGHT * 2.0 / 5.0 - FONT_SIZE * 2;
const FONT_SIZE = 14;

export default class MainComponent extends Component {
  constructor(props) {
    super(props)
  }

  _getSeekSliderPosition() {
    if (
      this.props.currentTime != null &&
      this.props.duration != null
    ) {
      return this.props.currentTime / this.props.duration;
    }
    return 0;
  }
  _onSeekSliderValueChange = value => {
    if (!this.props.isSeeking) {
      this.props.isSeeking = true;
    }
  };
  _onSeekSliderSlidingComplete = async value => {
    this.props.isSeeking = false;
    const seekPosition = value * this.props.duration;
    this._youTubeRef.seekTo(seekPosition);

  };

  render() {
    return (

      <ScrollView
        style={styles.container}
        onLayout={({ nativeEvent: { layout: { width } } }) => {
          if (!this.props.containerMounted) this.props.update({ containerMounted: true });
          if (this.props.containerWidth !== width) this.props.update({ containerWidth: width });
        }}
      >

        {this.props.containerMounted && (
          <YouTube
            ref={component => {
              this._youTubeRef = component;
            }}
            // You must have an API Key for the player to load in Android
            apiKey={YOUTUBE_API_KEY}
            // Un-comment one of videoId / videoIds / playlist.
            // You can also edit these props while Hot-Loading in development mode to see how
            // it affects the loaded native module
            videoId="ncw4ISEU5ik"
            // videoIds={['HcXNPI-IPPM', 'XXlZfc1TrD0', 'czcjU1w-c6k', 'uMK0prafzw0']}
            // playlistId="PLF797E961509B4EB5"
            play={this.props.isPlaying}
            loop={this.props.isLooping}
            fullscreen={this.props.fullscreen}
            modestBranding={this.props.modestBranding}
            controls={0}
            style={[
              { height: PixelRatio.roundToNearestPixel(this.props.containerWidth / (16 / 9)) },
              styles.player,
            ]}
            onError={e => this.props.update({ error: e.error })}
            onReady={e => this.props.update({ isReady: true })}
            onChangeState={e => this.props.update({ status: e.state })}
            onChangeQuality={e => this.props.update({ quality: e.quality })}
            onChangeFullscreen={e => this.props.update({ fullscreen: e.isFullscreen })}
            onProgress={e => this.props.update({ duration: e.duration, currentTime: e.currentTime })}
          />
        )}

        {/* Playing / Looping */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.props.update(({ isPlaying: !this.props.isPlaying }))}
          >
            <Text style={styles.buttonText}>
              {this.props.status == 'playing' ? 'Pause' : 'Play'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.props.update(({ isLooping: !this.props.isLooping }))}
          >
            <Text style={styles.buttonText}>
              {this.props.isLooping ? 'Looping' : 'Not Looping'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Previous / Next video */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this._youTubeRef && this._youTubeRef.previousVideo()}
          >
            <Text style={styles.buttonText}>Previous Video</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this._youTubeRef && this._youTubeRef.nextVideo()}
          >
            <Text style={styles.buttonText}>Next Video</Text>
          </TouchableOpacity>
        </View>

        {/* Fullscreen */}
        {!this.props.fullscreen && (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.props.update({ fullscreen: true })}
            >
              <Text style={styles.buttonText}>Set Fullscreen</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Slider for seeking */}
        <Slider
          style={styles.playbackSlider}
          value={this._getSeekSliderPosition()}
          onValueChange={this._onSeekSliderValueChange}
          onSlidingComplete={this._onSeekSliderSlidingComplete}
          disabled={this.props.isLoading}
        />
        {/* Update Progress & Duration (Android) */}
        {Platform.OS === 'android' && (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                this._youTubeRef
                  ? this._youTubeRef
                      .currentTime()
                      .then(currentTime => this.props.update({ currentTime }))
                      .catch(errorMessage => this.props.update({ error: errorMessage }))
                  : this._youTubeRef
                      .duration()
                      .then(duration => this.props.update({ duration }))
                      .catch(errorMessage => this.props.update({ error: errorMessage }))
              }
            >
              <Text style={styles.buttonText}>Update Progress & Duration (Android)</Text>
            </TouchableOpacity>
          </View>
        )}



        {/* Reload iFrame for updated props (Only needed for iOS) */}
        {Platform.OS === 'ios' && (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => this._youTubeRef && this._youTubeRef.reloadIframe()}
            >
              <Text style={styles.buttonText}>Reload iFrame (iOS)</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.instructions}>
          {this.props.isReady ? 'Player is ready' : 'Player setting up...'}
        </Text>
        <Text style={styles.instructions}>Status: {this.props.status}</Text>
        <Text style={styles.instructions}>Quality: {this.props.quality}</Text>

        {/* Show Progress */}
        <Text style={styles.instructions}>
          Progress: ({Math.trunc(this.props.currentTime / 60)}m:{Math.trunc(this.props.currentTime % 60,
          )}s) / ({Math.trunc(this.props.duration / 60)}m:{Math.trunc(
            this.props.duration % 60,
          )}s)
          {Platform.OS !== 'ios' && <Text> (Click Update Progress & Duration)</Text>}
        </Text>

        <Text style={styles.instructions}>
          {this.props.error ? 'Error: ' + this.props.error : ''}
        </Text>
      </ScrollView>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  button: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: 'blue',
  },
  buttonTextSmall: {
    fontSize: 15,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  player: {
    alignSelf: 'stretch',
    marginVertical: 10,
  },
  playbackSlider: {
    alignSelf: 'stretch',
  },
});
