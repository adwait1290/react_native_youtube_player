import React from 'react';
import { Dimensions, Image, Platform, Slider, StatusBar, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { Asset, Audio, Font, Video } from 'expo';
import { MaterialIcons, Octicons, Ionicons } from '@expo/vector-icons';
import { TabNavigator, TabBarBottom, StackNavigator } from 'react-navigation';
import { YouTube } from 'react-native-youtube';

const tintColor = '#2f95dc';
class Icon {
  constructor(module, width, height) {
    this.module = module;
    this.width = width;
    this.height = height;

  }
}

class PlaylistItem{
  constructor(name, uri, isVideo, isYoutube) {
    this.name = name;
    this.uri = uri;
    this.isVideo = isVideo;
    this.isYoutube = isYoutube;
  }V
}

const PLAYLIST = [
  new PlaylistItem(
    'Youtube Test Video',
    'https://www.youtube.com/watch?v=htPYk6QxacQ',
    true,
    true
  ),
  new PlaylistItem(
    'Comfort Fit - “Sorry”',
    'https://s3.amazonaws.com/exp-us-standard/audio/playlist-example/Comfort_Fit_-_03_-_Sorry.mp3',
    false,
    false
  ),
  new PlaylistItem(
    'Big Buck Bunny',
    'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    true,
    false
  ),
  new PlaylistItem(
    'Mildred Bailey – “All Of Me”',
    'https://ia800304.us.archive.org/34/items/PaulWhitemanwithMildredBailey/PaulWhitemanwithMildredBailey-AllofMe.mp3',
    false,
    false
  ),
  new PlaylistItem(
    "Popeye - I don't scare",
    'https://ia800501.us.archive.org/11/items/popeye_i_dont_scare/popeye_i_dont_scare_512kb.mp4',
    true,
    false
  ),
  new PlaylistItem(
    'Podington Bear - “Rubber Robot”',
    'https://s3.amazonaws.com/exp-us-standard/audio/playlist-example/Podington_Bear_-_Rubber_Robot.mp3',
    false,
    false
  ),
]

// CREDENTIALS
const YOUTUBE_API_KEY = '';
// STATIC CONSTANTS
const ICON_THROUGH_EARPIECE = 'speaker-phone';
const ICON_THROUGH_SPEAKER = 'speaker';
// ICONS
const ICON_PLAY_BUTTON = new Icon(require('./assets/images/play_button.png'), 34, 51);
const ICON_PAUSE_BUTTON = new Icon(require('./assets/images/pause_button.png'), 34, 51);
const ICON_STOP_BUTTON = new Icon(require('./assets/images/stop_button.png'), 22, 22);
const ICON_FORWARD_BUTTON = new Icon(require('./assets/images/forward_button.png'), 33, 25);
const ICON_BACK_BUTTON = new Icon(require('./assets/images/back_button.png'), 33, 25);
// PLAYLIST BUTTONS MIGHT NOT NEED
const ICON_LOOP_ALL_BUTTON = new Icon(require('./assets/images/loop_all_button.png'), 77, 35);
const ICON_LOOP_ONE_BUTTON = new Icon(require('./assets/images/loop_one_button.png'), 77, 35);

const ICON_TRACK_1 = new Icon(require('./assets/images/track_1.png'), 166, 5);
const ICON_THUMB_1 = new Icon(require('./assets/images/thumb_1.png'), 18, 19);
const ICON_THUMB_2 = new Icon(require('./assets/images/thumb_2.png'), 15, 19);

const ICON_MUTED_BUTTON = new Icon(require('./assets/images/muted_button.png'), 67, 58);
const ICON_UNMUTED_BUTTON = new Icon(require('./assets/images/unmuted_button.png'), 67, 58);

const LOOPING_TYPE_ALL = 0;
const LOOPING_TYPE_ONE = 1;
const LOOPING_TYPE_ICONS = { 0: ICON_LOOP_ALL_BUTTON, 1: ICON_LOOP_ONE_BUTTON };

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const BACKGROUND_COLOR = '#FFF8ED';
const DISABLED_OPACITY = 0.5;
const FONT_SIZE = 14;
const LOADING_STRING = '... loading ...';
const BUFFERING_STRING = '...buffering...';
const RATE_SCALE = 3.0;
const VIDEO_CONTAINER_HEIGHT = DEVICE_HEIGHT * 2.0 / 5.0 - FONT_SIZE * 2;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.index = 0;
    this.isSeeking = false;
    this.shouldPlayAtEndOfSeek = false;
    this.playbackInstance = null;
    this.state = {
        showVideo: false,
        playbackInstanceName: LOADING_STRING,
        loopingType: LOOPING_TYPE_ALL,
        muted: false,
        playbackInstancePosition: null,
        playbackInstanceDuration: null,
        shouldPlay: false,
        isPlaying: false,
        isBuffering: false,
        isLoading: true,
        fontLoaded: false,
        shouldCorrectPitch: true,
        volume: 1.0,
        rate: 1.0,
        videoWidth: DEVICE_WIDTH,
        videoHeight: VIDEO_CONTAINER_HEIGHT,
        poster: false,
        useNativeControls: false,
        fullscreen: false,
        throughEarpiece: false,
        isYoutube: false,
    };
  }
  shouldComponentUpdate() {
    return true;
  }
  //Fired after the component mounted
  componentDidMount() {

    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
    });
    (async () => {
      // Asyncronous load for fonts used.
      await Font.loadAsync({
        ...MaterialIcons.font,
        'cutive-mono-regular': require('./assets/fonts/CutiveMono-Regular.ttf'),
      });
      this.setState({ fontLoaded: true });
    })();
  }
  //Fired before the component will mount
  componentWillMount() {

  }
  async _loadNewPlaybackInstance(playing) {
    if (this.playbackInstance != null) {
      await this.playbackInstance.unloadAsync();
      this.playbackInstance.setOnPlaybackStatusUpdate(null);
      this.playbackInstance = null;
    }

    const source = { uri: PLAYLIST[this.index].uri };
    const initialStatus = {
      shouldPlay: playing,
      rate: this.state.rate,
      shouldCorrectPitch: this.state.shouldCorrectPitch,
      volume: this.state.volume,
      isMuted: this.state.muted,
      isLooping: this.state.loopingType === LOOPING_TYPE_ONE,
      playbackUpdateIntervalMillis: 100
      // // UNCOMMENT THIS TO TEST THE OLD androidImplementation:
      // androidImplementation: 'MediaPlayer',
    };

    if (PLAYLIST[this.index].isVideo) {
      if(PLAYLIST[this.index].isYoutube){
        this.state.isYoutube = true;
      }
      this._video.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate);
      await this._video.loadAsync(source, initialStatus);
      this.playbackInstance = this._video;
      const status = await this._video.getStatusAsync();
    } else {
      const { sound, status } = await Audio.Sound.create(
        source,
        initialStatus,
        this._onPlaybackStatusUpdate
      );
      this.playbackInstance = sound;
    }

    this._updateScreenForLoading(false);
  }

  _getVideoIdFromYoutube(url) {
    const videoId = url.split('/watch?v=')
    return videoId
  }

  _mountVideo = component => {
    this._video = component;
    this._loadNewPlaybackInstance(false);
  };

  _updateScreenForLoading(isLoading) {
    if (isLoading) {
      this.setState({
        showVideo: false,
        isPlaying: false,
        playbackInstanceName: LOADING_STRING,
        playbackInstanceDuration: null,
        playbackInstancePosition: null,
        isLoading: true,
      });
    } else {
      this.setState({
        playbackInstanceName: PLAYLIST[this.index].name,
        showVideo: PLAYLIST[this.index].isVideo,
        isLoading: false,
      });
    }
  }

  _onPlaybackStatusUpdate = status => {
    if (status.isLoaded) {
      this.setState({
        playbackUpdateIntervalMillis: 100,
        playbackInstancePosition: status.positionMillis,
        playbackInstanceDuration: status.durationMillis,
        shouldPlay: status.shouldPlay,
        isPlaying: status.isPlaying,
        isBuffering: status.isBuffering,
        rate: status.rate,
        muted: status.isMuted,
        volume: status.volume,
        loopingType: status.isLooping ? LOOPING_TYPE_ONE : LOOPING_TYPE_ALL,
        shouldCorrectPitch: status.shouldCorrectPitch,
        progressUpdateInvervalMillis: status.progressUpdateInvervalMillis,
        playableDurationMillis: status.playableDurationMillis,
      });
      if (status.didJustFinish && !status.isLooping) {
        this._advanceIndex(true);
        this._updatePlaybackInstanceForIndex(true);
      }
    } else {
      if (status.error) {
        console.log(`FATAL PLAYER ERROR: ${status.error}`);
      }
    }
  };

  _onLoadStart = () => {
    console.log(`ON LOAD START`);
  };

  _onLoad = status => {
    console.log(`ON LOAD : ${JSON.stringify(status)}`);
  };

  _onError = error => {
    console.log(`ON ERROR : ${error}`);
  };

  _onReadyForDisplay = event => {
    const widestHeight = DEVICE_WIDTH * event.naturalSize.height / event.naturalSize.width;
    if (widestHeight > VIDEO_CONTAINER_HEIGHT) {
      this.setState({
        videoWidth: VIDEO_CONTAINER_HEIGHT * event.naturalSize.width / event.naturalSize.height,
        videoHeight: VIDEO_CONTAINER_HEIGHT,
      });
    } else {
      this.setState({
        videoWidth: DEVICE_WIDTH,
        videoHeight: DEVICE_WIDTH * event.naturalSize.height / event.naturalSize.width,
      });
    }
  };

  _onFullscreenUpdate = event => {
    console.log(`FULLSCREEN UPDATE : ${JSON.stringify(event.fullscreenUpdate)}`);
  };

  _advanceIndex(forward) {
    this.index = (this.index + (forward ? 1 : PLAYLIST.length - 1)) % PLAYLIST.length;
  }

  async _updatePlaybackInstanceForIndex(playing) {
    this._updateScreenForLoading(true);

    this.setState({
      videoWidth: DEVICE_WIDTH,
      videoHeight: VIDEO_CONTAINER_HEIGHT,
    });

    this._loadNewPlaybackInstance(playing);
  }

  _onPlayPausePressed = () => {
    if (this.playbackInstance != null) {
      if (this.state.isPlaying) {
        this.playbackInstance.pauseAsync();
      } else {
        this.playbackInstance.playAsync();
      }
    }
  };

  _onStopPressed = () => {
    if (this.playbackInstance != null) {
      this.playbackInstance.stopAsync();
    }
  };

  _onForwardPressed = () => {
    if (this.playbackInstance != null) {
      this._advanceIndex(true);
      this._updatePlaybackInstanceForIndex(this.state.shouldPlay);
    }
  };

  _onBackPressed = () => {
    if (this.playbackInstance != null) {
      this._advanceIndex(false);
      this._updatePlaybackInstanceForIndex(this.state.shouldPlay);
    }
  };

  _onMutePressed = () => {
    if (this.playbackInstance != null) {
      this.playbackInstance.setIsMutedAsync(!this.state.muted);
    }
  };

  _onLoopPressed = () => {
    if (this.playbackInstance != null) {
      this.playbackInstance.setIsLoopingAsync(this.state.loopingType !== LOOPING_TYPE_ONE);
    }
  };

  _onVolumeSliderValueChange = value => {
    if (this.playbackInstance != null) {
      this.playbackInstance.setVolumeAsync(value);
    }
  };

  _trySetRate = async (rate, shouldCorrectPitch) => {
    if (this.playbackInstance != null) {
      try {
        await this.playbackInstance.setRateAsync(rate, shouldCorrectPitch);
      } catch (error) {
        // Rate changing could not be performed, possibly because the client's Android API is too old.
      }
    }
  };

  _onRateSliderSlidingComplete = async value => {
    this._trySetRate(value * RATE_SCALE, this.state.shouldCorrectPitch);
  };

  _onPitchCorrectionPressed = async value => {
    this._trySetRate(this.state.rate, !this.state.shouldCorrectPitch);
  };

  _onSeekSliderValueChange = value => {
    if (this.playbackInstance != null && !this.isSeeking) {
      this.isSeeking = true;
      this.shouldPlayAtEndOfSeek = this.state.shouldPlay;
      this.playbackInstance.pauseAsync();
    }
  };

  _onSeekSliderSlidingComplete = async value => {
    if (this.playbackInstance != null) {
      this.isSeeking = false;
      const seekPosition = value * this.state.playbackInstanceDuration;
      if (this.shouldPlayAtEndOfSeek) {
        this.playbackInstance.playFromPositionAsync(seekPosition);
      } else {
        this.playbackInstance.setPositionAsync(seekPosition);
      }
    }
  };

  _getSeekSliderPosition() {
    if (
      this.playbackInstance != null &&
      this.state.playbackInstancePosition != null &&
      this.state.playbackInstanceDuration != null
    ) {
      return this.state.playbackInstancePosition / this.state.playbackInstanceDuration;
    }
    return 0;
  }

  _getMMSSFromMillis(millis) {
    const totalSeconds = millis / 1000;
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor(totalSeconds / 60);

    const padWithZero = number => {
      const string = number.toString();
      if (number < 10) {
        return '0' + string;
      }
      return string;
    };
    return padWithZero(minutes) + ':' + padWithZero(seconds);
  }

  _getTimestamp() {
    if (
      this.playbackInstance != null &&
      this.state.playbackInstancePosition != null &&
      this.state.playbackInstanceDuration != null
    ) {
      return `${this._getMMSSFromMillis(
        this.state.playbackInstancePosition
      )} / ${this._getMMSSFromMillis(this.state.playbackInstanceDuration)}`;
    }
    return '';
  }

  _onPosterPressed = () => {
    this.setState({ poster: !this.state.poster });
  };

  _onUseNativeControlsPressed = () => {
    this.setState({ useNativeControls: !this.state.useNativeControls });
  };

  _onFullscreenPressed = () => {
    try {
      this._video.presentFullscreenPlayer();
    } catch (error) {
      console.log(error.toString());
    }
  };

  _onSpeakerPressed = () => {
    this.setState(
      state => {
        return { throughEarpiece: !state.throughEarpiece };
      },
      ({ throughEarpiece }) =>
        Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          playThroughEarpieceAndroid: throughEarpiece,
        })
    );
  };
  //if (PLAYLIST[this.index].isVideo) {
  // if (this.state.isYoutube){
    render() {
      // IF this is not a Youtube Video.
      if (!this.state.isYoutube){
      return !this.state.fontLoaded ? (
        <View style={styles.emptyContainer} />
      ) : (
        <View style={styles.container}>
          <View />
          <View style={styles.nameContainer}>
            <Text style={[styles.text, { fontFamily: 'cutive-mono-regular' }]}>
              {this.state.playbackInstanceName}
            </Text>
          </View>
          <View style={styles.space} />
          <View style={styles.videoContainer}>
            <Video
              ref={this._mountVideo}
              style={[
                styles.video,
                {
                  opacity: this.state.showVideo ? 1.0 : 0.0,
                  width: this.state.videoWidth,
                  height: this.state.videoHeight,
                },
              ]}
              resizeMode={Video.RESIZE_MODE_CONTAIN}
              onPlaybackStatusUpdate={this._onPlaybackStatusUpdate}
              onLoadStart={this._onLoadStart}
              onLoad={this._onLoad}
              onError={this._onError}
              onFullscreenUpdate={this._onFullscreenUpdate}
              onReadyForDisplay={this._onReadyForDisplay}
              useNativeControls={this.state.useNativeControls}
            />
          </View>
          <View
            style={[
              styles.playbackContainer,
              {
                opacity: this.state.isLoading ? DISABLED_OPACITY : 1.0,
              },
            ]}>
            <Slider
              style={styles.playbackSlider}
              trackImage={ICON_TRACK_1.module}
              thumbImage={ICON_THUMB_1.module}
              value={this._getSeekSliderPosition()}
              onValueChange={this._onSeekSliderValueChange}
              onSlidingComplete={this._onSeekSliderSlidingComplete}
              disabled={this.state.isLoading}
            />
            <View style={styles.timestampRow}>
              <Text style={[styles.text, styles.buffering, { fontFamily: 'cutive-mono-regular' }]}>
                {this.state.isBuffering ? BUFFERING_STRING : ''}

              </Text>

              <Text style={[styles.text, styles.buffering, { fontFamily: 'cutive-mono-regular' }]}>
                {this.state.playableDurationMillis}
              </Text>
              <Text style={[styles.text, styles.timestamp, { fontFamily: 'cutive-mono-regular' }]}>
                {this._getTimestamp()}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.buttonsContainerBase,
              styles.buttonsContainerTopRow,
              {
                opacity: this.state.isLoading ? DISABLED_OPACITY : 1.0,
              },
            ]}>
            <TouchableHighlight
              underlayColor={BACKGROUND_COLOR}
              style={styles.wrapper}
              onPress={this._onBackPressed}
              disabled={this.state.isLoading}>
              <Image style={styles.button} source={ICON_BACK_BUTTON.module} />
            </TouchableHighlight>
            <TouchableHighlight
              underlayColor={BACKGROUND_COLOR}
              style={styles.wrapper}
              onPress={this._onPlayPausePressed}
              disabled={this.state.isLoading}>
              <Image
                style={styles.button}
                source={this.state.isPlaying ? ICON_PAUSE_BUTTON.module : ICON_PLAY_BUTTON.module}
              />
            </TouchableHighlight>
            <TouchableHighlight
              underlayColor={BACKGROUND_COLOR}
              style={styles.wrapper}
              onPress={this._onStopPressed}
              disabled={this.state.isLoading}>
              <Image style={styles.button} source={ICON_STOP_BUTTON.module} />
            </TouchableHighlight>
            <TouchableHighlight
              underlayColor={BACKGROUND_COLOR}
              style={styles.wrapper}
              onPress={this._onForwardPressed}
              disabled={this.state.isLoading}>
              <Image style={styles.button} source={ICON_FORWARD_BUTTON.module} />
            </TouchableHighlight>
          </View>
          <View style={[styles.buttonsContainerBase, styles.buttonsContainerMiddleRow]}>
            <View style={styles.volumeContainer}>
              <TouchableHighlight
                underlayColor={BACKGROUND_COLOR}
                style={styles.wrapper}
                onPress={this._onMutePressed}>
                <Image
                  style={styles.button}
                  source={this.state.muted ? ICON_MUTED_BUTTON.module : ICON_UNMUTED_BUTTON.module}
                />
              </TouchableHighlight>
              <Slider
                style={styles.volumeSlider}
                trackImage={ICON_TRACK_1.module}
                thumbImage={ICON_THUMB_2.module}
                value={1}
                onValueChange={this._onVolumeSliderValueChange}
              />
            </View>
            <TouchableHighlight
              underlayColor={BACKGROUND_COLOR}
              style={styles.wrapper}
              onPress={this._onLoopPressed}>
              <Image
                style={styles.button}
                source={LOOPING_TYPE_ICONS[this.state.loopingType].module}
              />
            </TouchableHighlight>
          </View>
          <View style={[styles.buttonsContainerBase, styles.buttonsContainerBottomRow]}>
            <TouchableHighlight
              underlayColor={BACKGROUND_COLOR}
              style={styles.wrapper}
              onPress={() => this._trySetRate(1.0, this.state.shouldCorrectPitch)}>
              <View style={styles.button}>
                <Text style={[styles.text, { fontFamily: 'cutive-mono-regular' }]}>Rate:</Text>
              </View>
            </TouchableHighlight>
            <Slider
              style={styles.rateSlider}
              trackImage={ICON_TRACK_1.module}
              thumbImage={ICON_THUMB_1.module}
              value={this.state.rate / RATE_SCALE}
              onSlidingComplete={this._onRateSliderSlidingComplete}
            />
            <TouchableHighlight
              underlayColor={BACKGROUND_COLOR}
              style={styles.wrapper}
              onPress={this._onPitchCorrectionPressed}>
              <View style={styles.button}>
                <Text style={[styles.text, { fontFamily: 'cutive-mono-regular' }]}>
                  PC: {this.state.shouldCorrectPitch ? 'yes' : 'no'}
                </Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={this._onSpeakerPressed} underlayColor={BACKGROUND_COLOR}>
              <MaterialIcons
                name={this.state.throughEarpiece ? ICON_THROUGH_EARPIECE : ICON_THROUGH_SPEAKER}
                size={32}
                color="black"
              />
            </TouchableHighlight>
          </View>
          <View />
          {this.state.showVideo ? (
            <View>
              <View style={[styles.buttonsContainerBase, styles.buttonsContainerTextRow]}>
                <View />
                <TouchableHighlight
                  underlayColor={BACKGROUND_COLOR}
                  style={styles.wrapper}
                  onPress={this._onPosterPressed}>
                  <View style={styles.button}>
                    <Text style={[styles.text, { fontFamily: 'cutive-mono-regular' }]}>
                      Poster: {this.state.poster ? 'yes' : 'no'}
                    </Text>
                  </View>
                </TouchableHighlight>
                <View />
                <TouchableHighlight
                  underlayColor={BACKGROUND_COLOR}
                  style={styles.wrapper}
                  onPress={this._onFullscreenPressed}>
                  <View style={styles.button}>
                    <Text style={[styles.text, { fontFamily: 'cutive-mono-regular' }]}>
                      Fullscreen
                    </Text>
                  </View>
                </TouchableHighlight>
                <View />
              </View>
              <View style={styles.space} />
              <View style={[styles.buttonsContainerBase, styles.buttonsContainerTextRow]}>
                <View />
                <TouchableHighlight
                  underlayColor={BACKGROUND_COLOR}
                  style={styles.wrapper}
                  onPress={this._onUseNativeControlsPressed}>
                  <View style={styles.button}>
                    <Text style={[styles.text, { fontFamily: 'cutive-mono-regular' }]}>
                      Native Controls: {this.state.useNativeControls ? 'yes' : 'no'}
                    </Text>
                  </View>
                </TouchableHighlight>
                <View />
              </View>
            </View>
          ) : null}
        </View>

      );
      //ELIF this is a Youtube Video let's render a different View
    } else {
      return (
    <ScrollView
      style={styles.container}
      onLayout={({ nativeEvent: { layout: { width } } }) => {
        if (!this.state.containerMounted) this.setState({ containerMounted: true });
        if (this.state.containerWidth !== width) this.setState({ containerWidth: width });
      }}
    >
      <Text style={styles.welcome}>{'<YouTube /> component for\n React Native.'}</Text>
      <Text style={styles.instructions}>
        http://github.com/inProgress-team/react-native-youtube
      </Text>

      {this.state.containerMounted && (
        <YouTube
          ref={component => {
            this._youTubeRef = component;
          }}
          // You must have an API Key for the player to load in Android
          apiKey={YOUTUBE_API_KEY}
          // Un-comment one of videoId / videoIds / playlist.
          // You can also edit these props while Hot-Loading in development mode to see how
          // it affects the loaded native module
          videoId={_getVideoIdFromYoutube(this.state.uri)}
          // videoIds={['HcXNPI-IPPM', 'XXlZfc1TrD0', 'czcjU1w-c6k', 'uMK0prafzw0']}
          // playlistId="PLF797E961509B4EB5"
          play={this.state.isPlaying}
          loop={this.state.isLooping}
          fullscreen={this.state.fullscreen}
          controls={1}
          style={[
            { height: PixelRatio.roundToNearestPixel(this.state.containerWidth / (16 / 9)) },
            styles.player,
          ]}
          onError={e => this.setState({ error: e.error })}
          onReady={e => this.setState({ isReady: true })}
          onChangeState={e => this.setState({ status: e.state })}
          onChangeQuality={e => this.setState({ quality: e.quality })}
          onChangeFullscreen={e => this.setState({ fullscreen: e.isFullscreen })}
          onProgress={e => this.setState({ duration: e.duration, currentTime: e.currentTime })}
        />
      )}

      {/* Playing / Looping */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => this.setState(s => ({ isPlaying: !s.isPlaying }))}
        >
          <Text style={styles.buttonText}>
            {this.state.status == 'playing' ? 'Pause' : 'Play'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => this.setState(s => ({ isLooping: !s.isLooping }))}
        >
          <Text style={styles.buttonText}>
            {this.state.isLooping ? 'Looping' : 'Not Looping'}
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

      {/* Go To Specific time in played video with seekTo() */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => this._youTubeRef && this._youTubeRef.seekTo(15)}
        >
          <Text style={styles.buttonText}>15 Seconds</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => this._youTubeRef && this._youTubeRef.seekTo(2 * 60)}
        >
          <Text style={styles.buttonText}>2 Minutes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => this._youTubeRef && this._youTubeRef.seekTo(15 * 60)}
        >
          <Text style={styles.buttonText}>15 Minutes</Text>
        </TouchableOpacity>
      </View>

      {/* Play specific video in a videoIds array by index */}
      {this._youTubeRef &&
        this._youTubeRef.props.videoIds &&
        Array.isArray(this._youTubeRef.props.videoIds) && (
          <View style={styles.buttonGroup}>
            {this._youTubeRef.props.videoIds.map((videoId, i) => (
              <TouchableOpacity
                key={i}
                style={styles.button}
                onPress={() => this._youTubeRef && this._youTubeRef.playVideoAt(i)}
              >
                <Text style={[styles.buttonText, styles.buttonTextSmall]}>{`Video ${i}`}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

      {/* Get current played video's position index when playing videoIds (and playlist in iOS) */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            this._youTubeRef &&
            this._youTubeRef
              .videosIndex()
              .then(index => this.setState({ videosIndex: index }))
              .catch(errorMessage => this.setState({ error: errorMessage }))
          }
        >
          <Text style={styles.buttonText}>Get Videos Index: {this.state.videosIndex}</Text>
        </TouchableOpacity>
      </View>

      {/* Fullscreen */}
      {!this.state.fullscreen && (
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ fullscreen: true })}
          >
            <Text style={styles.buttonText}>Set Fullscreen</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Update Progress & Duration (Android) */}
      {Platform.OS === 'android' && (
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              this._youTubeRef
                ? this._youTubeRef
                    .currentTime()
                    .then(currentTime => this.setState({ currentTime }))
                    .catch(errorMessage => this.setState({ error: errorMessage }))
                : this._youTubeRef
                    .duration()
                    .then(duration => this.setState({ duration }))
                    .catch(errorMessage => this.setState({ error: errorMessage }))
            }
          >
            <Text style={styles.buttonText}>Update Progress & Duration (Android)</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Standalone Player (iOS) */}
      {Platform.OS === 'ios' &&
        YouTubeStandaloneIOS && (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                YouTubeStandaloneIOS.playVideo('KVZ-P-ZI6W4')
                  .then(() => console.log('iOS Standalone Player Finished'))
                  .catch(errorMessage => this.setState({ error: errorMessage }))
              }
            >
              <Text style={styles.buttonText}>Launch Standalone Player</Text>
            </TouchableOpacity>
          </View>
        )}

      {/* Standalone Player (Android) */}
      {Platform.OS === 'android' &&
        YouTubeStandaloneAndroid && (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                YouTubeStandaloneAndroid.playVideo({
                  apiKey: 'YOUR_API_KEY',
                  videoId: 'KVZ-P-ZI6W4',
                  autoplay: true,
                  lightboxMode: false,
                  startTime: 124.5,
                })
                  .then(() => console.log('Android Standalone Player Finished'))
                  .catch(errorMessage => this.setState({ error: errorMessage }))
              }
            >
              <Text style={styles.buttonText}>Standalone: One Video</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                YouTubeStandaloneAndroid.playVideos({
                  apiKey: 'YOUR_API_KEY',
                  videoIds: ['HcXNPI-IPPM', 'XXlZfc1TrD0', 'czcjU1w-c6k', 'uMK0prafzw0'],
                  autoplay: false,
                  lightboxMode: true,
                  startIndex: 1,
                  startTime: 99.5,
                })
                  .then(() => console.log('Android Standalone Player Finished'))
                  .catch(errorMessage => this.setState({ error: errorMessage }))
              }
            >
              <Text style={styles.buttonText}>Videos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                YouTubeStandaloneAndroid.playPlaylist({
                  apiKey: 'YOUR_API_KEY',
                  playlistId: 'PLF797E961509B4EB5',
                  autoplay: false,
                  lightboxMode: false,
                  startIndex: 2,
                  startTime: 100.5,
                })
                  .then(() => console.log('Android Standalone Player Finished'))
                  .catch(errorMessage => this.setState({ error: errorMessage }))
              }
            >
              <Text style={styles.buttonText}>Playlist</Text>
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
        {this.state.isReady ? 'Player is ready' : 'Player setting up...'}
      </Text>
      <Text style={styles.instructions}>Status: {this.state.status}</Text>
      <Text style={styles.instructions}>Quality: {this.state.quality}</Text>

      {/* Show Progress */}
      <Text style={styles.instructions}>
        Progress: {Math.trunc(this.state.currentTime)}s ({Math.trunc(this.state.duration / 60)}:{Math.trunc(
          this.state.duration % 60,
        )}s)
        {Platform.OS !== 'ios' && <Text> (Click Update Progress & Duration)</Text>}
      </Text>

      <Text style={styles.instructions}>
        {this.state.error ? 'Error: ' + this.state.error : ''}
      </Text>
    </ScrollView>
  );
    }
    }

}

const styles = StyleSheet.create({
  emptyContainer: {
    alignSelf: 'stretch',
    backgroundColor: BACKGROUND_COLOR,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: BACKGROUND_COLOR,
  },
  wrapper: {},
  nameContainer: {
    height: FONT_SIZE,
  },
  space: {
    height: FONT_SIZE,
  },
  videoContainer: {
    height: VIDEO_CONTAINER_HEIGHT,
  },
  video: {
    maxWidth: DEVICE_WIDTH,
  },
  playbackContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    minHeight: ICON_THUMB_1.height * 2.0,
    maxHeight: ICON_THUMB_1.height * 2.0,
  },
  playbackSlider: {
    alignSelf: 'stretch',
  },
  timestampRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    minHeight: FONT_SIZE,
  },
  text: {
    fontSize: FONT_SIZE,
    minHeight: FONT_SIZE,
  },
  buffering: {
    textAlign: 'left',
    paddingLeft: 20,
  },
  timestamp: {
    textAlign: 'right',
    paddingRight: 20,
  },
  button: {
    backgroundColor: BACKGROUND_COLOR,
  },
  buttonsContainerBase: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonsContainerTopRow: {
    maxHeight: ICON_PLAY_BUTTON.height,
    minWidth: DEVICE_WIDTH / 2.0,
    maxWidth: DEVICE_WIDTH / 2.0,
  },
  buttonsContainerMiddleRow: {
    maxHeight: ICON_MUTED_BUTTON.height,
    alignSelf: 'stretch',
    paddingRight: 20,
  },
  volumeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: DEVICE_WIDTH / 2.0,
    maxWidth: DEVICE_WIDTH / 2.0,
  },
  volumeSlider: {
    width: DEVICE_WIDTH / 2.0 - ICON_MUTED_BUTTON.width,
  },
  buttonsContainerBottomRow: {
    maxHeight: ICON_THUMB_1.height,
    alignSelf: 'stretch',
    paddingRight: 20,
    paddingLeft: 20,
  },
  rateSlider: {
    width: DEVICE_WIDTH / 2.0,
  },
  buttonsContainerTextRow: {
    maxHeight: FONT_SIZE,
    alignItems: 'center',
    paddingRight: 20,
    paddingLeft: 20,
    minWidth: DEVICE_WIDTH,
    maxWidth: DEVICE_WIDTH,
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
});
