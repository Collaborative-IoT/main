import {
  Client,
  AuthCredentials,
  ClientSubscriber,
} from "@collaborative/arthur";

const main = async () => {
  let auth_credentials: AuthCredentials = {
    access: process.env.ACCESS as string,
    refresh: process.env.REFRESH as string,
    oauth_type: "discord",
  };

  let subscriber = new ClientSubscriber();
  subscriber.good_auth = (data) => {
    console.log("auth_passed");
  };
  subscriber.bad_auth = (data) => {
    console.log(data);
  };
  subscriber.top_rooms = (data) => {
    console.log("rooms_data:", data[0]);
  };
  subscriber.your_data = (data) => {
    console.log(data);
  };
  let example_client = new Client(
    "ws://127.0.0.1:3030/user-api",
    subscriber,
    auth_credentials
  );
  example_client.begin();
  //give 4 seconds to connect until sending request
  setTimeout(() => {
    example_client.send("create_room", {
      name: "test",
      desc: "test2",
      public: true,
    });
    example_client.send("get_top_rooms", {});
    example_client.send("my_data", {});
  }, 4000);
};

main();
