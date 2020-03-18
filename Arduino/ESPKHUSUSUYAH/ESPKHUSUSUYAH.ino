#include <PubSubClient.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <ESP8266WiFi.h>
LiquidCrystal_I2C lcd(0x27,16,2);

////////////////////////////////////////////////////
char ssid[] = "ojo";
char pass[] = "digantimaneh";
WiFiClient wifiConnection;

////////////////////////////////////////////////////
const int salinitas = A0;          //Salinitas 
float mapping = 0;

int relayAsin = D3;
int relayTawar= D4;
String dUyah;

float batasBawahSalinitas = 28;
float batasAtasSalinitas = 32;

/////////////////////mqtt///////////////////////////
PubSubClient mqttClient(wifiConnection);
const char* mqttHost = "m24.cloudmqtt.com";
const int mqttPort = 12505;

//////////////////////////////////////////
void setup() {
  Serial.begin(9600);
  Wire.begin(D2,D1);
  
  lcd.begin(16,2);
  lcd.backlight();
  
  wifiConnect();
  mqttClient.setServer(mqttHost, mqttPort);
  mqttClient.setCallback(callback);

  pinMode(relayAsin, OUTPUT);
  pinMode(relayTawar, OUTPUT);
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

////////////////////////////////////////////////////////
void mqttReconnect(){
  if(mqttClient.connect("tamam-device-salinitas", "ulreypzx", "8UMU1gd2rU36")){
    Serial.println("mqtt connected");
    mqttClient.subscribe("batasSalinitas");
  }else{
    Serial.print("failed, rc=");
    Serial.print(mqttClient.state());
    Serial.println(" try again in on second");
  } 
}

////////////////callback for mqtt///////////////////////
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

  int commaIndex = r.indexOf(',');
  int secondCommaIndex = r.indexOf(',', commaIndex + 1);

  String firstValue = r.substring(0, commaIndex);
  String secondValue = r.substring(commaIndex + 1, secondCommaIndex);

  batasBawahSalinitas = firstValue.toFloat();
  batasAtasSalinitas = secondValue.toFloat();
  
  Serial.println(batasBawahSalinitas);
  Serial.println(batasAtasSalinitas);
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
    }
    mqttClient.loop();
  }  
  tampilanLCD();  
  dataSalinitas();
  delay(500);
}

//////////////////////////////////////////
void dataSalinitas(){
          int sensorValue; //adc value
          float outputValueConductivity; //conductivity value
          float outputValueTDS; //TDS value
              //read the analog in value:
              sensorValue = analogRead(salinitas);
              //Mathematical Conversion from ADC to conductivity (uSiemens)
              //rumus berdasarkan datasheet
              outputValueConductivity = (0.2142*sensorValue)+494.93;
              //Mathematical Conversion from ADC to TDS (ppm)
              //rumus berdasarkan datasheet
              outputValueTDS = (0.3417*sensorValue)+281.08;
              //          
              
             mapping = map( sensorValue  , 300, 660, 0, 40);
             dUyah = mapping;
             kirimDataKeServer(dUyah); 
             
             
              if(mapping<batasBawahSalinitas)
             {
              digitalWrite(relayAsin,LOW); //mekan
              digitalWrite(relayTawar,HIGH); //mati
             }
             else if(mapping>=batasAtasSalinitas)
             {
              digitalWrite(relayTawar,LOW);
              digitalWrite(relayAsin,HIGH);  
             }
             else
             {
              digitalWrite(relayAsin,HIGH);
              digitalWrite(relayTawar,HIGH);
             }
                ;  
//          Serial.print("konduktivitas = ");
//          Serial.print(outputValueConductivity);
//          Serial.print(" TDS = ");
//          Serial.print(outputValueTDS);
//          Serial.print("   Salinitas = ");
//          Serial.print(mapping);
//          Serial.print(" ADC = ");
//          Serial.println(sensorValue);
   
}
/////////////////////////////////////////////////
void kirimDataKeServer(String d_Uyah){
  //kirim data uyah
  char dUyahArr[5];
  String(d_Uyah).toCharArray(dUyahArr, 5);
  mqttClient.publish("esp/salinitas", dUyahArr);
  Serial.print(dUyah + ", ");
  Serial.println("\t Kirim data ke server =================");
}

/////////////////////////////////////////////////
void tampilanLCD(){
          lcd.clear();
          lcd.setCursor(0, 0);
          lcd.print("K.Garam");
          lcd.setCursor(8, 0);
          lcd.print(":");
          lcd.setCursor(9,0);
          lcd.print(mapping,1);
          lcd.setCursor(12,0);
          lcd.print("ppt");
}
