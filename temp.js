import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Card, Text } from "react-native-elements";
import firebase from "firebase";
import moment from "moment";

import { Context as OrderContext } from "../context/OrdersContext";
import { Context as AuthContext } from "../context/AuthContext";

const Orders = ({ navigation }) => {
  const [orders, setOrders] = useState([]); // initially empty
  const [customerList, setCustomerList] = useState(false);
  const [userdata, setUserdata] = useState([]); // initially empty
  const [showloading, setShowloading] = useState(true);

  const {
    state: { user1 },
  } = useContext(AuthContext);

  const {
    state: { processingOrderId },
    processingOrder,
  } = useContext(OrderContext);

  const GetdataUsers = async () => {
    let grabbedData = [];
    let grabbedData1 = [];
    await firebase
      .database()
      .ref(`/users/${user1.uid}`)
      .orderByKey()
      .on("value", (snapshot, key) => {
        console.log("snapshot....", snapshot);
        grabbedData.push(snapshot.val());
        setUserdata(grabbedData);
        if (grabbedData) {
          let customerList1 = [];
           firebase
            .database()
            .ref(`/serviceProvider/${user1.uid}/franchise/customers`)
            .orderByKey()
            .on("value", (snapshot) => {
              customerList1.push(snapshot.val());
              setCustomerList(customerList1);
              if (customerList1) {
                Object.keys(customerList1).map(function (key) {
                  let y = customerList1[key];
                   Object.keys(y).map(function (key2) {
                      let x = y[key2];
                       firebase
                        .database()
                        .ref(`/orders/${x}`)
                        .orderByKey()
                        .on("value", (snapshot, key) => {
                          grabbedData1.push(snapshot.val());
                          console.log("grabbedData1....");
                          setShowloading(false);
                          setOrders(grabbedData1);
                        });
                    })
                });
              }
            });
        }
      });
  };

  useEffect(() => {
    GetdataUsers();
  }, []); //  }, [orders]);

  const userdata1 = userdata;
  let userdataIds;
  if (userdata1) {
    userdataIds = Object.keys(userdata1);
  }

  const orders1 = orders;
  let orderIds;
  if (orders1) {
    orderIds = Object.keys(orders1);
  }
  
  return (
    <View>
      <ScrollView>
        {showloading ? (
          <View style={[styles.containerLoading, styles.horizontal]}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <View>
            {orders ? (
              Object.keys(orders).map(function (key) {
                let x = orders[key];
                // console.log(x)
                if (x) {
                  return Object.keys(x).map(function (key2, i) {
                    let y = x[key2]; //y.date
                    let total = 0;
                    let totalqty = 0;
                    return !y.OrderStatus ? (
                      <Card
                        key={i}
                        containerStyle={{
                          borderRadius: 4,
                          padding: 15,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            let processingOrder1 = key2;
                            processingOrder({ processingOrder1, uid: y.uid });
                            navigation.navigate("OrdersProcessing");
                          }}
                        >
                          <View>
                            <View style={styles.orderidText}>
                              {/* <Text style={styles.orderidTextChild}>
                              Invoice No: {y.InvoiceData.invoiceNo}
                            </Text> */}
                              <Text style={styles.orderidTextChild}>
                                Order No: {key2}
                              </Text>
                              <Text style={styles.orderidTextChild}>
                                Date:{" "}
                                {moment(y.date).format(" D/M/YYYY, h:mm:ss a")}
                              </Text>
                              <Text style={styles.orderidTextChild}>
                                Order Status: {}
                                {y.OrderStatus
                                  ? y.OrderStatus.orderStatus
                                  : null}
                              </Text>
                            </View>
                          </View>
                          <Card.Divider style={{ marginTop: 8 }} />
                          <View
                            style={{
                              flex: 2,
                              flexDirection: "row",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                width: 110,
                              }}
                            >
                              Product
                            </Text>
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "bold",
                              }}
                            >
                              Price
                            </Text>
                          </View>
                          <Card.Divider style={{ marginTop: 8 }} />
                          {Object.keys(y).map(function (key3) {
                            let z = y[key3];
                            return Object.keys(z).map(function (key4, j) {
                              let a = z[key4];
                              if (!y.OrderStatus && a.name) {
                                total = a.price * a.qty + total;
                                totalqty = a.qty + totalqty;
                              }
                              return !y.OrderStatus ? (
                                a.name ? (
                                  <View style={styles.cardInternal} key={j}>
                                    <View style={styles.user}>
                                      <Image
                                        style={styles.image}
                                        resizeMode="cover"
                                        source={
                                          a.type === "Beverage"
                                            ? require("../../assets/tea.jpg")
                                            : require("../../assets/food.png")
                                        }
                                      />
                                      <View style={styles.namePrice}>
                                        <Text style={styles.name}>
                                          {a.name}
                                        </Text>
                                        <View
                                          style={{
                                            flex: 2,
                                            flexDirection: "row",
                                            justifyContent: "flex-end",
                                          }}
                                        >
                                          <Text style={styles.price}>
                                            &#x20B9;{a.price}{" "}
                                          </Text>
                                          {a.qty ? (
                                            <Text style={styles.price}>
                                              ({a.qty})
                                            </Text>
                                          ) : null}
                                        </View>
                                      </View>
                                    </View>
                                    <Card.Divider style={{ marginTop: 8 }} />
                                  </View>
                                ) : null
                              ) : null;
                            });
                          })}
                          <View style={styles.totalText}>
                            <Text style={styles.subtotal}>
                              Total ({totalqty} items):{" "}
                            </Text>
                            <Text style={styles.subtotal}>
                              &#x20B9;{`${total}`}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </Card>
                    ) : null;
                  });
                }
              })
            ) : (
              <Card>
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                  }}
                >
                  No orders found
                </Text>
              </Card>
            )}
          </View>
        )}

        <Card>
          <Text
            style={{
              textAlign: "center",
              fontSize: 16,
            }}
          >
            End
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  namePrice: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  fonts: {
    marginBottom: 8,
  },
  orderidText: {
    flex: 1,
    justifyContent: "space-between",
    fontSize: 18,
    fontWeight: "bold",
  },
  orderidTextChild: {
    fontSize: 14,
    fontWeight: "bold",
  },
  user: {
    flexDirection: "row",
    marginBottom: 6,
  },
  viewText: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 25,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    width: 180,
    textAlign: "justify",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cartCount: {
    color: "white",
  },
  subtotal: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardInternal: {},
  totalText: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 13,
  },
});

export default Orders;
