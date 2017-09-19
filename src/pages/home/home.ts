import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Diagnostic } from '@ionic-native/diagnostic';

declare var OT: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  session: any;
  publisher: any;
  apiKey: string;
  sessionId: string;
  token: string;
  cameraSource = 0;
  devices: any[];

  constructor(public navCtrl: NavController, private diagnostic: Diagnostic) {
    // Replace these values with those generated in your TokBox Account
    this.apiKey = "";
    this.sessionId = "";
    this.token = "";
  }

  ionViewDidLoad(){
    let requestCameraCallback = (isAvailable) => { if(!isAvailable){this.diagnostic.requestCameraAuthorization();} };
    let requestMicrophoneaCallback = (isAvailable) => { if(!isAvailable){this.diagnostic.requestMicrophoneAuthorization();} };
    let errorCallback = (e) => console.error(e);

    // Checks camera permissions
    this.diagnostic.isCameraAvailable().then(requestCameraCallback, errorCallback);
    // Checks microphone permissions
    this.diagnostic.isMicrophoneAuthorized().then(requestMicrophoneaCallback,errorCallback);
  }

  // Starts Call
  startCall() {
    this.session = OT.initSession(this.apiKey, this.sessionId);

    // Subscribe to a newly created stream
    this.session.on('streamCreated', (event) => {
      this.session.subscribe(event.stream, 'subscriber', {
        insertMode: 'append',
        resolution: '1280x720',
        showControls: false,
        width: '100%',
        height: '100%'
      });
    });

    this.session.on('sessionDisconnected', (event) => {

    });
    
    // Connect to the session
    this.session.connect(this.token, (error) => {
      if (!error) {
        // Create a publisher
        this.publisher = OT.initPublisher('publisher', {
          insertMode: 'append',
          resolution: '1280x720',
          width: '100%',
          height: '100%'  
          });
          
          this.session.publish(this.publisher, (error) => {
            if(error){
              console.log("Publisher error: " + error);
            }
          });
      } else {
        alert('There was an error connecting to the session' + error.message);
      }
    });
  }

  // Ends call
  endCall() {
    if (!!this.session) {
      this.session.disconnect();
    }
  }

  // Switch between cameras
  toggleCamera() {
    this.cameraSource = this.cameraSource == 0 ? 1 : 0;
    this.session.unpublish(this.publisher);
    this.publisher = OT.initPublisher('publisher', {
      insertMode: 'append',
      resolution: '1280x720',
      width: '100%',
      height: '100%',
      videoSource: this.devices[this.cameraSource].deviceId
    });
    this.session.publish(this.publisher);
  }

}
