import ora from 'ora';

/**
 * Small wrapper around ora to standardize messages, colors etc.
 */
export default (text) => {

    const spinner = ora(text).start();

    return {
        setText: (content) => {
            spinner.text = content;
            spinner.render();
        },
        succeed: (content) => {
            spinner.color = 'green';
            spinner.succeed(content);
        },
    };

};
