#include <PubSubClient.h>
#include <ESP8266WiFi.h>
#include <SoftwareSerial.h>

SoftwareSerial toMega(D7,D8); //TX//RX
WiFiClient wifiConnection;

char ssid[] = "ojo";
char pass[] = "digantimaneh";

//mqtt
PubSubClient mqttClient(wifiConnection);
const char* mqttHost = "m24.cloudmqtt.com";
const int mqttPort = 12505;

////////////////////////////////////////////////////
String bacaString;
String suhu;
String ph;
String keruh;

//////////////////////////////////////////
void setup() {
  Serial.begin(9600);
  while(!Serial){
    ;
  }

  Serial.println("Serial esp ready");
  toMega.begin(9600);
  Serial.println("Serial to arduino ready");
  delay(10);   

//  WiFi.mode(WIFI_STA);
//  WiFi.persistent(false);
  wifiConnect();

  mqttClient.setServer(mqttHost, mqttPort);
  mqttClient.setCallback(callback);

}

////////////////////////////////////////////
void wifiConnect(){  
  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED){
    delay(50);
  }
  Serial.print("Tersambung dg IP: ");
  Serial.println(WiFi.localIP());
}
void mqttReconnect(){
  if(mqttClient.connect("tamam-device", "ulreypzx", "8UMU1gd2rU36")){
    Serial.println("mqtt connected");
    mqttClient.subscribe("batasSuhu");
    mqttClient.subscribe("batasPh");
    mqttClient.subscribe("batasKekeruhan");
  }else{
    Serial.print("failed, rc=");
    Serial.print(mqttClient.state());
    Serial.println(" try again in on second");
  } 
}

///////////////callback for mqtt////////////////
void callback(char *topic, byte *payload, unsigned int length){
  String topicString = String(topic);
  String r = "";
  for (int i = 0; i < length; i++){
    r += (char)payload[i];
  }
  Serial.print("Topic: ");
  Serial.print(topic);
  Serial.print(" ");
  Serial.print("Payload: ");
  Serial.print(r);
  Serial.println("");
  
  if(topicString == "batasSuhu"){    
    r += ",";
    for(int i = 0; i < r.length(); i++){
      toMega.write(r[i]);
    }
  }else if(topicString == "batasPh"){
    r += ",";
    for(int i = 0; i < r.length(); i++){
      toMega.write(r[i]);
    }
  }else if(topicString == "batasKekeruhan"){
    r += ",";
    for(int i = 0; i < r.length(); i++){
      toMega.write(r[i]);
    }
  }
}


//////////////////////////////////
void loop(){
  if(WiFi.status() != WL_CONNECTED){
    Serial.println("wifi diskonek");  
    WiFi.disconnect(true);
    wifiConnect();
  }else{
    if(!mqttClient.connected()){
      mqttReconnect();
    }else{
      ambilDataMega();
    }
  
    mqttClient.loop();
  }  
}

/////////////////////////////////////////////////
void ambilDataMega(){
  if(toMega.available()){
    char a = toMega.read();
    if(a == ','){
      if (bacaString.length() > 1) {
        float n = bacaString.toFloat();  
        if(bacaString.indexOf('o') >0){
          suhu = n;
        }else if(bacaString.indexOf('p') >0){
          ph = n;
        }else if(bacaString.indexOf('q') >0){
          keruh = n;
          kirimDataKeServer();
        }
        bacaString="";
      }
    }else{
      bacaString += a;
    }
  } 
}

///////////////////////////////////////////////////////////
void kirimDataKeServer(){
  //kirim data api
  char suhuArr[5];
  String(suhu).toCharArray(suhuArr, 5);
  mqttClient.publish("esp/suhu", suhuArr);
  Serial.print(suhu + ", ");
  
  //kirim data kelembaban
  char phArr[5];
  String(ph).toCharArray(phArr, 5);
  mqttClient.publish("esp/ph", phArr); 
  Serial.print(ph + ", ");
  
  //kirim data suhu
  char keruhArr[5];
  String(keruh).toCharArray(keruhArr, 5);
  mqttClient.publish("esp/kekeruhan", keruhArr);
  Serial.print(keruh + ", ");

  Serial.println("\t Kirim data ke server =================");
}
