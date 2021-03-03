import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { TextInput, StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import io from 'socket.io-client'
import Constants from 'expo-constants';
import Dialog from "react-native-dialog";

const Stuff = require('./constants.js');

export default class App extends React.Component {

  constructor() {
    super();
    this.state = {
      username: '',
      message: '',
      messages: [],
      id: 0,
      deviceTemp: Constants.deviceName,
      connections: 0,
      visible: true,
    };
  }

  componentDidMount() {
    // this.socket = io(Stuff.localhost);
    this.socket = io(Stuff.remoteServer);
    this.socket.on('chatmessage', texts => {
      // ts = texts;
      this.setState({ messages: [...texts], message: this.state.message, id: this.state.id + 1, deviceTemp: this.state.deviceTemp, connections: this.state.connections})
    });
    this.socket.on('connections', connection => {
      this.setState({ messages: this.state.messages, message: this.state.message, id: this.state.id + 1, deviceTemp: this.state.deviceTemp, connections: connection});
    })

  }

  submitMessage = () => {
    try {
      if(this.state.message != '') {
        this.socket.emit('chatmessage', { 
          name: this.state.username,
          message: this.state.message}
        );
      }
    } catch(e) {console.log(e)}
    this.setState({message: ''});
  }

  changeMsg = (text) => {
    // alert(typeof text);
    this.setState({message: text, messages: this.state.messages, id: this.state.id, connections: this.state.connections});
  }

  render() {
    let chatMsgs = this.state.messages.map((msg, key) => (
      <View style={styles.panel} key={key}>
        <Text style={styles.clients}>{msg.name + ':'}</Text>
        <Text key={this.state.id} style={styles.messages}>{msg.message}</Text>
      </View>));

    return (
      <View style={styles.container}>

        <Dialog.Container visible={this.state.visible}>
          <Dialog.Title>Please Insert Your Username!</Dialog.Title>
          <Dialog.Input
            style={styles.dialogue}
            onChangeText={(text) => this.setState({ username: text })}
          ></Dialog.Input>
          <Dialog.Button label="Submit" onPress={() => {
            if(this.state.username.length != 0)
              this.setState( { visible: false } );
            }}/>
        </Dialog.Container>
        
        <View style={styles.titleContainer}>
          <Text style={styles.room}>The Z Room</Text>
          <Text style={[styles.clients, {fontSize: 13, marginTop: 0, color: 'lightgreen'}]}>{"Users Connected: " + this.state.connections}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.container2} 
        ref={ref => {this.scrollView = ref}}
        onContentSizeChange={() => this.scrollView.scrollToEnd({animated: true})}>
          {chatMsgs}
        </ScrollView>

        <TextInput
          style={styles.input}
          autoCorrect={false}
          value={this.state.message}
          placeholder='Enter message'
          placeholderTextColor='white'
          onSubmitEditing={this.submitMessage}
          onChangeText={this.changeMsg}
        /> 
        <StatusBar style='dark'/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    backgroundColor: 'black',
  },

  dialogue: {
    borderWidth: 1,
    borderRadius: 3,
  },

  clients: {
    fontSize: 13,
    color: 'black',
    marginLeft: 0,
    marginRight: 10,
  },
  
  input: {
    borderWidth: 1,
    height: 40,
    marginBottom: 20,
    borderRadius: 8,
    fontSize: 17,
    padding: 10,
    width: '90%',
    marginLeft: '5%',
    borderColor: 'white',
    color: 'white',
    // position: 'absolute',
  },

  messages: {
    fontSize: 20,
    marginLeft: 10,
  },

  panel: {
    margin: 10,
    padding: 5,
    borderRadius: 10,
    backgroundColor: 'lightgreen',
    // width: '95%',
  },

  room: {
    fontSize: 35,
    marginTop: 40,
    color: 'white',
    color: 'lightgreen',
  },

  titleContainer: {
    alignItems: 'center',
  },
});
