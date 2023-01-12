# import sys
# sys.path.append('/home/myeongwon/mw_dir/Ensemble_DR/Ensemble_DR/src/')

from flask import Flask, render_template, request, jsonify
from EnsembleDR import EnsembleDR

app= Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/ensembleDR")
def ensembleDR():
    title=request.args.get('title')
    pca_iter=int(request.args.get('pca'))
    random_iter=int(request.args.get('random'))
    perplexity=int(request.args.get('perp'))
    learning_rate=int(request.args.get('lr'))
    iteration=int(request.args.get('iter'))
    min_supports=int(request.args.get('min_sup'))

    class_list = {'breast_cancer':'diagnosis','milknew':'Grade','mobile_price':'price_range',
            'fashion-mnist':'label','diabetes':'Diabetes_012'}

    from datetime import datetime
    int(datetime.now().timestamp())

    import uuid
    uuid.uuid4()



    class_col=None
    if title in class_list:
        class_col = class_list[title]

    ensemble_DR = EnsembleDR(title = title, 
        class_col=class_col,
        perplexity=perplexity,
        iteration=iteration,
        learning_rate=learning_rate,
        min_supports=[min_supports],
        pca_iter=pca_iter,
        random_iter=random_iter)

    result = ensemble_DR.run()

    
    return jsonify(result)


if __name__ == "__main__":
    app.run(port=50001, debug=True)