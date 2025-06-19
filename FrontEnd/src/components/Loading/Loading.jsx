import React from "react";
import { PropagateLoader } from "react-spinners";

const Loading = ({loading}) => {
  return (
    <div>
      <div className="flex justify-center items-center my-96">
        <PropagateLoader
          color={"#22c55e"}
          loading={loading}
          size={30}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    </div>
  );
};

export default Loading;
