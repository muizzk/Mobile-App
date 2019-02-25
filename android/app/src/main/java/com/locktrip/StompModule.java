package com.locktrip;

import android.util.Log;
import android.widget.Toast;
import android.content.Context;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.glassfish.tyrus.client.ClientManager;
import org.springframework.messaging.converter.StringMessageConverter;
import org.springframework.messaging.simp.stomp.ConnectionLostException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import javax.websocket.DeploymentException;

import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nullable;
import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

public class StompModule extends ReactContextBaseJavaModule {
    final String TAG = "StompModule";
    
    private ReactApplicationContext _reactContext;
    private WebSocketStompClient _client = null;
    StompHeaders _stompHeaders = new StompHeaders();
    StompSession _session = null;
    StompSession.Subscription _lastSubscription = null;

    String _url = "";
    String _message = "";
    String _destination = "";
    String _stateBeforePause = "";

    boolean _isOnce = false;
    boolean _sendMessageOnSubscribe = true;

    StompSessionHandler _sessionHandler = new StompSessionHandler() {
        @Override
        public void afterConnected(StompSession session, StompHeaders connectedHeaders) {
            Log.e(TAG, "Connected~~~~");
            _session = session;
            StompModule.this.onConnect();

            if (_isOnce) {
                StompModule.this.subscription();
            }
        }

        @Override
        public void handleException(StompSession session, StompCommand command, StompHeaders headers, byte[] payload, Throwable exception) {
            Log.e(TAG, "handleException~~~~");
            disconnect();
            StompModule.this.onError(1, "Unknown Error Occured!");
            exception.printStackTrace();
        }

        @Override
        public void handleTransportError(StompSession session, Throwable exception) {
            Log.e(TAG, "handleTransportError~~~~");            
            disconnect();            
            if (exception instanceof ConnectionLostException) {
                // if connection lost, call this
                StompModule.this.onError(2, "Connection Lost!");
            }
            else if (exception instanceof DeploymentException) {
                // if connection failed, call this
                StompModule.this.onError(3, "Connection Failed!");
            }
            else {
                //unknown issues
                StompModule.this.onError(1, "Unknown Error Occured!");
            }

            exception.printStackTrace();
        }

        @Override
        public Type getPayloadType(StompHeaders headers) {
            return String.class;
        }

        @Override
        public void handleFrame(StompHeaders headers, Object payload) {
            Log.e(TAG, "handleFrame: '" + payload.toString() + "'");
            onMessage(payload.toString());
        }
    };

    public StompModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this._reactContext = reactContext;
        // reactContext.addLifecycleEventListener(this);
    }

    @Override
    public String getName() {
        return "StompModule";
    }

    public WebSocketStompClient client() {
        if (_client != null)
            return _client;
        ClientManager clientManager = ClientManager.createClient();
        WebSocketClient webSocketClient = new StandardWebSocketClient(clientManager);

        ThreadPoolTaskScheduler taskScheduler = new ThreadPoolTaskScheduler();
        taskScheduler.afterPropertiesSet();
        WebSocketStompClient stompClient = new WebSocketStompClient(webSocketClient);
        stompClient.setMessageConverter(new StringMessageConverter());
        stompClient.setTaskScheduler(taskScheduler);
        stompClient.setReceiptTimeLimit(5000);
        return stompClient;
    }

    private void connect() {
        Log.e(TAG, "connect~~~~  0");
        _client = this.client();
        if (!_client.isRunning() || _session == null || !_session.isConnected()) {
            Log.e(TAG, "connect~~~~  1, url: '" + _url + "'");
            try {
                _client.connect(_url, new WebSocketHttpHeaders(), _stompHeaders, _sessionHandler);
            } catch (IllegalStateException ex) {
                StompModule.this.onError(4, "Connection Closed!");
            }
        }
        Log.e(TAG, "connect~~~~  2");
    }

    private void disconnect() {
        Log.e(TAG, "disconnect");
        try {
            unSubscription();
            if (_session != null) {
                _session.disconnect();
                _session = null;
            }
        } catch (IllegalStateException ex) {
            _session = null;
            _lastSubscription = null;
        }
    }

    private void unSubscription() {
        if (_lastSubscription != null) {
            _lastSubscription.unsubscribe();
            _lastSubscription = null;
        }
    }

    private void subscription() {
        Log.e(TAG, "subscription");
        if (_session != null && _session.isConnected()) {
            Log.e(TAG, "subscription1, " +
                "message: '" + _message + "'"
                + ", destination: '" + _destination + "'"
                + ", sendMessageOnSubscribe: '" + _sendMessageOnSubscribe + "'"

            );
            // Log.e(TAG, _message);
            this.unSubscription();

            _lastSubscription = _session.subscribe(_destination, _sessionHandler);
            if (this._sendMessageOnSubscribe) {
                Log.e(TAG, "subscription2, sending " + 
                    "message: '" + _message + "'"
                + ", destination: 'search'"
                );
                _session.send("search", _message);
            }
        }
        else {
            Log.e(TAG, "subscription3, else connect");
            _isOnce = false;
            connect();
        }
    }

    // @Override
    // public void onHostPause() {
    //     this._stateBeforePause = this._url;
    //     this._url = "";
    //     this.disconnect();
    // }


    // @Override
    // public void onHostResume() {
    //     this.connect(this._stateBeforePause,this._destination);
    // }

    // @Override
    // public void onHostDestroy() {
    //     this._url = "";
    //     this.disconnect();
    // }


    private void onConnect() {
        this.emitEventToJS("onStompConnect", null);
    }

    private void onError(int type, String message) {
        Log.e(TAG, "onError, type: '" + type + ", message: '"+ message + "'");
        WritableMap event = Arguments.createMap();
        event.putInt("type", type); // 1: unknown, 2: connection lost, 3: connection failed.
        event.putString("message", message);
        this.emitEventToJS("onStompError", event);
    }

    private void onMessage(String message) {
        WritableMap event = Arguments.createMap();
        event.putString("message", message);
        this.emitEventToJS("onStompMessage", event);
    }

    @ReactMethod
    public void connect(String url, String destination){
        Log.e(TAG, "Connect (React), url: '" + url + ", destination: '"+ destination + "'");
        this._url = url;
        _isOnce = true;
        // this.connect();
        this._destination = destination;
        new Thread(this::connect).start();
    }

    @ReactMethod
    public void connect(String url, String destination, boolean sendMessageOnSubscribe) {
        Log.e(TAG, "Connect (React), " +
            "url: '" + url + "'" + 
            ", destination: '"+ destination + "'" +
            ", sendMessageOnSubscribe: '"+ sendMessageOnSubscribe + "'"
        );
        this._sendMessageOnSubscribe = sendMessageOnSubscribe;
        this.connect(url, destination);
    }

    @ReactMethod
    public void getData(String message, String destination) {
        // _message = "{\"uuid\":\"e38effa6-491f-4e9e-b3b4-e4a2f71ed835\",\"query\":\"?region=52612&currency=EUR&startDate=15/09/2018&endDate=16/09/2018&rooms=%5B%7B%22adults%22:2,%22children%22:%5B%5D%7D%5D\"}";
        // _destination = "search/e38effa6-491f-4e9e-b3b4-e4a2f71ed835";
        this._message = message;
        this._destination = destination;

        // Log.e(TAG, message);
        // Log.e(TAG, destination);
        // this.subscription();
        new Thread(this::subscription).start();
    }

    @ReactMethod
    public void close() {
        new Thread(this::unSubscription).start();
        // this.unSubscription();
    }
    
    private void emitEventToJS(String eventName, @Nullable WritableMap eventData){
        this._reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, eventData);
    }
}
