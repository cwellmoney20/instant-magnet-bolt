/*
  # Enable Realtime on photos table

  Adds the photos table to the supabase_realtime publication so that
  INSERT events are broadcast to subscribed clients. This is required
  for the dashboard's real-time upload notification feature to work.
*/

ALTER PUBLICATION supabase_realtime ADD TABLE photos;
