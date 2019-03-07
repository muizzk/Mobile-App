#!/bin/bash

create_socket_patch() {
# 	cat > $1 <<- EOF
	echo """diff -x .DS_Store -ur a/node_modules/react-native/Libraries/WebSocket/RCTWebSocket.xcodeproj/project.pbxproj b/node_modules/react-native/Libraries/WebSocket/RCTWebSocket.xcodeproj/project.pbxproj
--- a/node_modules/react-native/Libraries/WebSocket/RCTWebSocket.xcodeproj/project.pbxproj	2018-05-09 00:21:09.000000000 +0300
+++ b/node_modules/react-native/Libraries/WebSocket/RCTWebSocket.xcodeproj/project.pbxproj	2019-03-05 11:55:03.000000000 +0200
@@ -9,7 +9,6 @@
 /* Begin PBXBuildFile section */
 		1338BBE01B04ACC80064A9C9 /* RCTSRWebSocket.m in Sources */ = {isa = PBXBuildFile; fileRef = 1338BBDD1B04ACC80064A9C9 /* RCTSRWebSocket.m */; };
 		1338BBE11B04ACC80064A9C9 /* RCTWebSocketExecutor.m in Sources */ = {isa = PBXBuildFile; fileRef = 1338BBDF1B04ACC80064A9C9 /* RCTWebSocketExecutor.m */; };
-		13526A521F362F7F0008EF00 /* libfishhook.a in Frameworks */ = {isa = PBXBuildFile; fileRef = 13526A511F362F7F0008EF00 /* libfishhook.a */; };
 		2D3B5F3D1D9B165B00451313 /* RCTSRWebSocket.m in Sources */ = {isa = PBXBuildFile; fileRef = 1338BBDD1B04ACC80064A9C9 /* RCTSRWebSocket.m */; };
 		2D3B5F3E1D9B165B00451313 /* RCTWebSocketExecutor.m in Sources */ = {isa = PBXBuildFile; fileRef = 1338BBDF1B04ACC80064A9C9 /* RCTWebSocketExecutor.m */; };
 		2D3B5F401D9B165B00451313 /* RCTWebSocketModule.m in Sources */ = {isa = PBXBuildFile; fileRef = 3C86DF7B1ADF695F0047B81A /* RCTWebSocketModule.m */; };
@@ -19,6 +18,7 @@
 		3DBE0D151F3B185A0099AA32 /* fishhook.c in Sources */ = {isa = PBXBuildFile; fileRef = 3DBE0D121F3B185A0099AA32 /* fishhook.c */; };
 		3DBE0D801F3B1AF00099AA32 /* fishhook.h in CopyFiles */ = {isa = PBXBuildFile; fileRef = 3DBE0D131F3B185A0099AA32 /* fishhook.h */; };
 		3DBE0D821F3B1B0C0099AA32 /* fishhook.h in CopyFiles */ = {isa = PBXBuildFile; fileRef = 3DBE0D131F3B185A0099AA32 /* fishhook.h */; };
+		5A3D4FB5222E7EF700EA9024 /* libfishhook.a in Frameworks */ = {isa = PBXBuildFile; fileRef = 3DBE0D001F3B181A0099AA32 /* libfishhook.a */; };
 		A12E9E2E1E5DEC4E0029001B /* RCTReconnectingWebSocket.m in Sources */ = {isa = PBXBuildFile; fileRef = A12E9E2D1E5DEC4E0029001B /* RCTReconnectingWebSocket.m */; };
 		A12E9E2F1E5DEC550029001B /* RCTReconnectingWebSocket.m in Sources */ = {isa = PBXBuildFile; fileRef = A12E9E2D1E5DEC4E0029001B /* RCTReconnectingWebSocket.m */; };
 /* End PBXBuildFile section */
@@ -87,7 +87,7 @@
 			isa = PBXFrameworksBuildPhase;
 			buildActionMask = 2147483647;
 			files = (
-				13526A521F362F7F0008EF00 /* libfishhook.a in Frameworks */,
+				5A3D4FB5222E7EF700EA9024 /* libfishhook.a in Frameworks */,
 			);
 			runOnlyForDeploymentPostprocessing = 0;
 		};
@@ -435,7 +435,7 @@
 				EXECUTABLE_PREFIX = lib;
 				GCC_PREPROCESSOR_DEFINITIONS = (
 					\"DEBUG=1\",
-          \"RCT_METRO_PORT=\${RCT_METRO_PORT}\",
+					\"RCT_METRO_PORT=\${RCT_METRO_PORT}\",
 					\"\$(inherited)\",
 				);
 				GCC_TREAT_WARNINGS_AS_ERRORS = NO;
""" > $1
}

fix_glog() {
	echo; 
	echo "===================================="
	echo "Patching glog for 'config.h' issue"
	echo "===================================="
	echo;
	cd ./node_modules/react-native
	./scripts/ios-install-third-party.sh 
	cd third-party/glog-0.3.4
	../../scripts/ios-configure-glog.sh

	echo; 
	echo "==========================================="
	echo "Done. (Patching glog for 'config.h' issue)"; 
	echo "==========================================="
	echo
}


fix_websocket()  {
	echo;
	echo "==============================================================="
	echo "Patching React/Libraries/WebSocket for 'libfishhook.a' issue"
	echo "==============================================================="
	echo;

	#cd node_modules/react-native/Libraries/WebSocket
	pfile="patch-socket.diff"
	destfile="node_modules/react-native/Libraries/WebSocket/RCTWebSocket.xcodeproj/project.pbxproj"
	create_socket_patch "$pfile"	
	patch-apply.sh "$pfile"
	ls -l "$destfile"
	echo; 
	echo "========================================================================="
	echo "Done. (Patching React/Libraries/WebSocket for 'libfishhook.a' issue)"; 
	echo "========================================================================="
	echo
}


# execute
if [ "$1" == "" ]; then
	fix_glog
	fix_websocket
else
	case "$1" in
		"glog") fix_glog
						;;
						
		"websocket" | "fish" | "libfishhook" | "socket")
						fix_websocket
						;;
		*)
						echo; echo "Usage: $0 glog|websocket (where websocket can also be fish|libfishhook)"
	esac
fi