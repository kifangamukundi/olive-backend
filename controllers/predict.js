const { PythonShell } = require('python-shell');

exports.predictPrice =async (req, res, next) => {
  const data = req.body;

  try {
    const options = {
        mode: 'text',
        // path to your Python interpreter
        pythonPath: process.env.PYTHON_PATH,
        // get print results in real-time
        pythonOptions: ['-u'], 
        scriptPath: __dirname,
        // pass the data as an argument
        args: [JSON.stringify(data)]
      };

      PythonShell.run('predict.py', options, (err, result) => {
        if (err) throw err;
        // send the prediction as response
        res.status(200).json({ sucess: true, message: "Success", data:{result: result} });
      });


  } catch (err) {
    next(err);
  }
};

  
  
  