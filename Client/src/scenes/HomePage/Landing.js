import React from "react";
import {
  Typography,
  Container,
  Grid,
} from "@material-ui/core";

const FrontPage = () => {
  return (
    <Container style={{ height: "90vh" }}>
      <Grid
        container
        spacing={2}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Grid item xs={12} md={6}>
          <Container>
            <Typography variant="h5">Health Matters</Typography>
            <Typography variant="h2" fontWeight={600}>One Step Solution</Typography>
          </Container>
        </Grid>
        <Grid item xs={12} md={6}>
          <div
            style={{
              marginTop: "150px",
              background:
                `url(${require('./homeimg.jpeg')}) top/cover no-repeat`,
              height: "50vh",
              width: "100%",
            }}
          ></div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FrontPage;