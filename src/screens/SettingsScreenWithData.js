import { debounce, omit } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Alert, Clipboard } from 'react-native';
import Mailer from 'react-native-mail';
import { loadAddress, loadSeedPhrase } from '../model/wallet';
import SettingsScreen from './SettingsScreen';

const FeedbackEmailAddress = 'contact+alphafeedback@balance.io';

const handleSendFeedbackError = debounce(error => (
  error ? Alert.alert(
    'Error launching email client',
    'Would you like to manually copy our feedback email address to your clipboard?',
    [
      { text: 'Copy email address', onPress: () => Clipboard.setString(FeedbackEmailAddress) },
      { text: 'No thanks', style: 'cancel' },
    ],
  ) : null
), 250);

export default class SettingsScreenWithData extends Component {
  static propTypes = {
    isScreenActive: PropTypes.bool,
  }

  state = {
    address: '',
    seedPhrase: null,
  }

  shouldComponentUpdate = ({ isScreenActive, ...nextProps }, nextState) => {
    if (!isScreenActive && this.state.seedPhrase) {
      this.handleHideSeedPhrase();
    }

    const isNewProps = nextProps !== omit(this.props, 'isScreenActive');
    const isNewState = nextState !== this.state;

    return isNewProps || isNewState;
  }

  componentDidMount = () => loadAddress().then(address => this.setState({ address }))

  handleHideSeedPhrase = () => this.setState({ seedPhrase: null })

  handleSendFeedback = () =>
    Mailer.mail({
      recipients: [FeedbackEmailAddress],
      subject: '📱 Balance Wallet Alpha Feedback',
    }, handleSendFeedbackError)

  handleToggleShowSeedPhrase = () => {
    if (!this.state.seedPhrase) {
      loadSeedPhrase().then(seedPhrase => this.setState({ seedPhrase }));
    } else {
      this.handleHideSeedPhrase();
    }
  }

  render = () => (
    <SettingsScreen
      {...this.props}
      {...this.state}
      onSendFeedback={this.handleSendFeedback}
      onToggleShowSeedPhrase={this.handleToggleShowSeedPhrase}
    />
  )
}
